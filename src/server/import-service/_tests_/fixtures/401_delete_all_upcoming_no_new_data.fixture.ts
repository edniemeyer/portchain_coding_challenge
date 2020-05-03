/** Test scenario
 * Deletes all upcoming storedPortCalls from cursor on and keep the older portCalls if there is no newPortCall
 */
import {
  MergeAction, MergeActionType, ImportedVesselSchedule, StoredVesselSchedule,
} from '../../data-types';

import moment = require('moment');



const storedVesselSchedule: StoredVesselSchedule = {
  vessel: {
    imo: 1,
    name: 'Dummy vessel'
  },
  portCalls: [{
    id: 1,
    arrival: moment('2019-02-01T00:00:00Z'),
    departure: moment('2019-02-02T00:00:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1',
    isDeleted: false
  }, {
    id: 2,
    arrival: moment('2019-02-10T00:00:00Z'),
    departure: moment('2019-02-11T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2',
    isDeleted: false
  }, {
    id: 3,
    arrival: moment('2019-02-12T00:00:00Z'),
    departure: moment('2019-02-13T00:00:00Z'),
    portId: 'FAKE3',
    portName: 'Fake port 3',
    isDeleted: false
  }, {
    id: 4,
    arrival: moment('2019-02-25T00:00:00Z'),
    departure: moment('2019-02-28T00:00:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1',
    isDeleted: false
  }, {
    id: 5,
    arrival: moment('2019-03-05T00:00:00Z'),
    departure: moment('2019-03-06T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2',
    isDeleted: false
  }, {
    id: 6,
    arrival: moment('2019-04-01T00:00:00Z'),
    departure: moment('2019-04-01T00:00:00Z'),
    portId: 'FAKE3',
    portName: 'Fake port 3',
    isDeleted: false
  }, {
    id: 7,
    arrival: moment('2019-04-10T00:00:00Z'),
    departure: moment('2019-04-11T00:00:00Z'),
    portId: 'FAKE1',
    portName: 'Fake port 1',
    isDeleted: false
  }, {
    id: 8,
    arrival: moment('2019-04-12T00:00:00Z'),
    departure: moment('2019-04-13T00:00:00Z'),
    portId: 'FAKE2',
    portName: 'Fake port 2',
    isDeleted: false
  }]
};

const importedVesselSchedule: ImportedVesselSchedule = {
  cursorValueAtFetchTime: moment('2019-03-05'),
  vessel: storedVesselSchedule.vessel,
  portCalls: [],
};

const expectedMergeActions: MergeAction[] = [ {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[4],
    importedPortCall: null
  }, {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[5],
    importedPortCall: null
  }, {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[6],
    importedPortCall: null
  }, {
    action: MergeActionType.DELETE,
    storedPortCall: storedVesselSchedule.portCalls[7],
    importedPortCall: null
  }
]
export {
  importedVesselSchedule,
  storedVesselSchedule,
  expectedMergeActions,
};
