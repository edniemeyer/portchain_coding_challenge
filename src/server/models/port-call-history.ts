import {Table, Column, Model, DataType, AutoIncrement, CreatedAt, PrimaryKey, BelongsTo} from 'sequelize-typescript';
import { Moment } from 'moment';
import Vessel from './vessel';
import { PortCall } from '.';
 
@Table({
  tableName: 'port_calls_history', 
  underscored: true,
})
export default class PortCallHistory extends Model<PortCallHistory> {
 
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;
 
  @Column(DataType.DATE)
  arrival: Moment;

  @Column(DataType.DATE)
  departure: Moment;

  @Column(DataType.STRING)
  portId: string;

  @Column(DataType.STRING)
  portName: string;

  @Column(DataType.BOOLEAN)
  isInsert: boolean;

  @Column(DataType.BOOLEAN)
  isUpdate: boolean;

  @Column(DataType.BOOLEAN)
  isDelete: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdDate: Moment;

  @Column(DataType.DATE)
  logDate: Moment;

  @BelongsTo(() => Vessel, 'vessel_imo')
  vessel: Vessel;
}
