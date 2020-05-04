import { fetchAvailableVessels, fetchFullVesselSchedule } from "../provider-api"
import { Vessel, PortCall, PortCallHistory } from "../models"
import { Moment }  from 'moment'
import { mergeVesselSchedules } from "./vessel-schedule-merger"
import { MergeActionType, MergeAction } from "./data-types"



/**
 * Fetches vessels from the coding challenge API and upsert them into the local DB
 * You only need to run this one but there is no harm in running it many times
 */
export const importVesselsIntoLocalDatabase = async () => {
  console.info('Importing vessels into the database...')
  const vesselsFromAPI = await fetchAvailableVessels()
  for(const vessel of vesselsFromAPI) {
    await Vessel.findOrCreate({
      where: {
        imo: vessel.imo, 
        name: vessel.name
      }
    })
  }
  console.info('All vessels were successfully imported into the database')
}

const importFullVesselSchedule = async (vessel:Vessel) => {
  console.info(`Reconstructing the full schedule history for vessel ${vessel.name} (${vessel.imo})`)
  await PortCall.destroy({
    where: {vessel_imo: vessel.imo},
    force: true
  })
  await fetchFullVesselSchedule(vessel, async (cursor:Moment, importedVesselSchedule:PortCall[]) => {

    // This function is called in-order for each value of cursor (from 2019-01-01 to 2019-05-31) with the vessel schedule at that cursor
    const existingPortCalls = await PortCall.findAll({where: {vessel_imo: vessel.imo, is_deleted: false}})
    const mergeActions = await mergeVesselSchedules({
        vessel: vessel,
        cursorValueAtFetchTime: cursor,
        portCalls: importedVesselSchedule
      }, {
        vessel,
        portCalls: existingPortCalls
      })

    for(const mergeAction of mergeActions) {
      switch(mergeAction.action) {
        case MergeActionType.INSERT:
          const portCall = await PortCall.create({...mergeAction.importedPortCall, vessel_imo: vessel.imo})
          await PortCallHistory.create({...mergeAction.importedPortCall, port_call_id: portCall.id, vessel_imo: vessel.imo, logDate: cursor, isInsert: true})
          break;
        case MergeActionType.DELETE:
          await PortCall.update({isDeleted: true}, {where: {id: mergeAction.storedPortCall.id}})
          const {id, ...storedPortCallNoId} = mergeAction.storedPortCall
          await PortCallHistory.create({ ...storedPortCallNoId, port_call_id: mergeAction.storedPortCall.id, vessel_imo: vessel.imo, logDate: cursor, isDelete: true})
          break;
        case MergeActionType.UPDATE:
          await PortCall.update({
            arrival: mergeAction.importedPortCall.arrival,
            departure: mergeAction.importedPortCall.departure
          }, {where: {id: mergeAction.storedPortCall.id}})
          await PortCallHistory.create({...mergeAction.importedPortCall, port_call_id: mergeAction.storedPortCall.id, vessel_imo: vessel.imo, logDate: cursor, isUpdate: true})
          break;
      }
    }
    logSummaryOfImportStep(cursor, vessel, importedVesselSchedule, existingPortCalls, mergeActions)
  })
  console.info(`Vessel ${vessel.name} (${vessel.imo}) has been fully imported into the local database`)
}


/**
 *  The safeImportAllSchedules function is exposed by a button on the front end, 
 *   It is built to prevent running multiple imports in parallel
 */
let importRunning = false
export const safeImportAllSchedules = async () => {
  if(importRunning) {
    throw new Error('An import process is already running')
  }
  importRunning = true
  importSingleVesselSchedules()
    .finally(() => {
      importRunning = false
    })
}

export const importAllVesselsSchedules = async () => {
  const vessels = await Vessel.findAll()
  await Promise.all(vessels.map(async vessel => { await importFullVesselSchedule(vessel) }))
}

export const importSingleVesselSchedules = async (vessel?:Vessel) => {
  if(!vessel) {
    const vessels = await Vessel.findAll()
    vessel = vessels[0]
  }
  await importFullVesselSchedule(vessel)
}

const logSummaryOfImportStep = (cursor:Moment, vessel:Vessel, importedVesselSchedule:PortCall[], existingPortCalls:PortCall[], mergeActions:MergeAction[]) => {
  const accumulator = {
    inserts: 0,
    updates: 0,
    deletes: 0,
  }
  mergeActions.reduce((acc:any, mergeAction) => {
    switch(mergeAction.action) {
      case MergeActionType.INSERT:
        acc.inserts ++
        break;
      case MergeActionType.DELETE:
        acc.deletes ++
        break;
      case MergeActionType.UPDATE:
        acc.updates ++
        break;
    }
    return acc
  }, accumulator)

  console.log(`[Import summary] vessel=${vessel.name} (${vessel.imo}), portCallsInDB=${existingPortCalls.length}, cursor=${cursor.format('YYYY-MM-DD')}, portCallsFetchedFromImportAPI=${importedVesselSchedule.length}, inserts=${accumulator.inserts}, updates=${accumulator.updates}, deletes=${accumulator.deletes}`)
}