import {
  ImportedVesselSchedule, StoredVesselSchedule, MergeAction, MergeActionType,
} from './data-types';

import moment = require('moment-timezone')
import { loadAllFixtures } from './_tests_/fixtures';
import * as referenceImplementation from './reference-implementation'

moment.tz.setDefault("UTC");
const fixtures = loadAllFixtures()
/**
 * Outputs a list of actions based on 2 inputs: (1) a new vessel schedule and (2) an existing vessel schedule.
 * The possible actions are described in the enum 'MergeActionType'. These are:
 *   - INSERT: inserts a new port call in the database
 *   - UPDATE: updates an existing port call in the database
 *   - DELETE: removes a port call from the database
 */
export const mergeVesselSchedules = async (importedVesselSchedule: ImportedVesselSchedule, storedVesselSchedule: StoredVesselSchedule): Promise<MergeAction[]> => {
  if (referenceImplementation.isConfigured) {
    // This is calling Portchain's reference implementation of the merging algorithm.
    // It is only for Portchain's internal use and not available to candidates.
    return await referenceImplementation.mergeVesselSchedules(importedVesselSchedule, storedVesselSchedule)
  } else {
    const payload: any = {}
    const cursor = importedVesselSchedule.cursorValueAtFetchTime;

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
    }).filter((pc: any) => moment(pc.arrival).isAfter(cursor.clone().subtract(6, 'days'))) // arrivals before that threshold won't be imported anymore from the API

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

    if (payload.existingPortCalls.length === 0 && payload.newPortCalls.length === 0) {
      return []
    }

    let responseData = merger(payload, cursor);


    try {
      responseData = responseData.filter((actionData: any) => actionData.action !== 'match') // The reference implementation returns the perfect match but the coding challenge does not require it
      // console.log(JSON.stringify(responseData, null, 2))
      const mergeActions: MergeAction[] = responseData.map((actionData: any) => {

        if (actionData.newPortCall) {
          actionData.newPortCall.arrival = moment(actionData.newPortCall.arrival)
          actionData.newPortCall.departure = moment(actionData.newPortCall.departure)
        }
        if (actionData.existingPortCall) {
          actionData.existingPortCall.arrival = moment(actionData.existingPortCall.arrival)
          actionData.existingPortCall.departure = moment(actionData.existingPortCall.departure)
        }

        return {
          action: referenceImplementation.referenceActionToLocalActionEnum(actionData.action),
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
      console.log(e)

      throw e;
    }
  }
};

const merger = (payload: any, cursor: moment.Moment): any[] => {
  let responseData: any[] = [];
  //no data in database
  if (payload.existingPortCalls.length === 0) {
    payload.newPortCalls.forEach((newPortCall: any) => {
      responseData.push({
        action: "insert",
        newPortCall
      })
    })
    return responseData;
  } else if (payload.newPortCalls.length === 0) { // if no new data from the API, delete all stored portCalls from cursor on
    payload.existingPortCalls.forEach((existingPortCall: any) => {
      if (moment(existingPortCall.arrival).isSameOrAfter(cursor)) {
        responseData.push({
          action: "delete",
          existingPortCall
        })
      }
    })
  } else {
    payload.newPortCalls.forEach((newPortCall: any) => {
      //filtering by port id
      const existingPortCallsByPort = payload.existingPortCalls
        .filter((existingPortCall: any) =>
          (existingPortCall.port.unLocode === newPortCall.port.unLocode))

      // there is no info about this port stored
      if (existingPortCallsByPort.length === 0) {
        responseData.push({
          action: "insert",
          newPortCall,
        })
      } else {
        // there is info about this port stored and should be validated
        const validatedPort = findWithinWeek(existingPortCallsByPort, newPortCall)
        if (validatedPort) {
          const { id, isDeleted, ...matchingPortValues } = validatedPort;
          if (JSON.stringify(matchingPortValues) !== JSON.stringify(newPortCall)) {
            responseData.push({
              action: "update",
              newPortCall,
              existingPortCall: validatedPort
            })
          } else {
            responseData.push({
              action: "match",
              newPortCall,
              existingPortCall: validatedPort
            })
          }
          // removing from stack validated portCall
          payload.existingPortCalls = payload.existingPortCalls
            .filter((existingPortCall: any) =>
              (existingPortCall !== validatedPort))
        } else {
          // so it's an insertion
          responseData.push({
            action: "insert",
            newPortCall,
          })
        }
      }
    })
  }
  //missing port calls should be deleted
  /*
  You can delete a port call from the DB if both the following conditions are met:
  - Its ETD is after MIN(cursor, api.firstPortCall.ETA)
  - The port call from the DB cannot be resolved to any port call from the API
  */
  if (payload.newPortCalls.length !== 0) {
    payload.existingPortCalls.forEach((existingPortCall: any) => {

      if (moment(existingPortCall.departure).isSameOrAfter(moment.min(moment(payload.newPortCalls[0].arrival), cursor))) {
        responseData.push({
          action: "delete",
          existingPortCall
        })
      }
    })
  }


  return responseData
}

const findWithinWeek = (existingPortCallsByPort: any, newPortCall: any) => {
  return existingPortCallsByPort.find((existingPortCall: any) => (moment(existingPortCall.arrival).isBetween(
    moment(newPortCall.arrival).subtract(7, 'days'), moment(newPortCall.arrival).add(7, 'days')))
    || (moment(existingPortCall.departure).isBetween(
      moment(newPortCall.departure).subtract(7, 'days'), moment(newPortCall.departure).add(7, 'days'))))
}