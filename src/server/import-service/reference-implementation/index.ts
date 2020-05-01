import fetch from 'node-fetch'
import { ImportedVesselSchedule, StoredVesselSchedule, MergeAction, MergeActionType } from '../data-types'
import moment = require('moment')
import { PORTCHAIN_MERGER_REFERENCE_IMPLEMENTATION_API_URL } from '../../conf'
import { response } from 'express'


export const referenceActionToLocalActionEnum = (referenceAction:string) => {
  if(referenceAction === 'update') {
    return MergeActionType.UPDATE
  } else if(referenceAction === 'insert') {
    return MergeActionType.INSERT
  } else if(referenceAction === 'delete') {
    return MergeActionType.DELETE
  } else {
    return null
  }
}

export const isConfigured = !!PORTCHAIN_MERGER_REFERENCE_IMPLEMENTATION_API_URL

/**
 * This 'reference' implementation is calling an external API that merges vessel schedules (port calls) together.
 * It is used internally at Portchain to validate the implementation of the scaffolding. It also allows us to verify that the tests covering the merging algorithm are sound.
 */
export const mergeVesselSchedules = async (importedVesselSchedule: ImportedVesselSchedule, storedVesselSchedule: StoredVesselSchedule): Promise<MergeAction[]> => {

  const payload:any = {}
  payload.existingPortCalls = storedVesselSchedule.portCalls.map(pc => {
    return {
      id: '' + pc.id,
      isDeleted: pc.isDeleted,
      arrival: pc.arrival,
      departure: pc.departure,
      port: {
        unLocode: pc.portId,
        name: pc.portName
      }
    }
  })
  payload.newPortCalls = importedVesselSchedule.portCalls.map(pc => {
    return {
      arrival: pc.arrival,
      departure: pc.departure,
      port: {
        unLocode: pc.portId,
        name: pc.portName
      }
    }
  })

  if(payload.existingPortCalls.length === 0 && payload.newPortCalls.length === 0) {
    return []
  }

  try {
    const response:any = await fetch(PORTCHAIN_MERGER_REFERENCE_IMPLEMENTATION_API_URL, {
        method: 'post',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    })
    let responseData = await response.json()
    responseData = responseData.filter((actionData:any) => actionData.action !== 'match') // The reference implementation returns the perfect match but the coding challenge does not require it
    // console.log(JSON.stringify(responseData, null, 2))
    const mergeActions:MergeAction[] = responseData.map((actionData:any) => {

      if(actionData.newPortCall) {
        actionData.newPortCall.arrival = moment(actionData.newPortCall.arrival)
        actionData.newPortCall.departure = moment(actionData.newPortCall.departure)
      }
      if(actionData.existingPortCall) {
        actionData.existingPortCall.arrival = moment(actionData.existingPortCall.arrival)
        actionData.existingPortCall.departure = moment(actionData.existingPortCall.departure)
      }

      return {
        action: referenceActionToLocalActionEnum(actionData.action),
        importedPortCall: actionData.newPortCall ? {
            arrival: actionData.newPortCall.arrival,
            departure: actionData.newPortCall.departure,
            portId: actionData.newPortCall.port.unLocode,
            portName: actionData.newPortCall.port.name
          } : null,
        storedPortCall: actionData.existingPortCall ? {
            id: parseInt(actionData.existingPortCall.id, 10),
            arrival: actionData.existingPortCall.arrival,
            departure: actionData.existingPortCall.departure,
            portId: actionData.existingPortCall.port.unLocode,
            portName: actionData.existingPortCall.port.name,
            isDeleted: false
          } : null
      }
    })
    return mergeActions
  } catch (e) {
    if(e.responseBody) {
      console.error((await e.responseBody).toString())
    } else {
      console.error('Failed to use reference API. Payload:', JSON.stringify(payload))
    }
    throw e
  }
  
  // const result = Buffer.from(response.base64, 'base64')
  return []
}