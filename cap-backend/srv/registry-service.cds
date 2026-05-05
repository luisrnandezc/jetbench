using { jetbench as db } from '../db/schema';

service RegistryService {

  entity AircraftModels as projection on db.AircraftModel;
  entity Aircraft as projection on db.Aircraft;
  entity EngineModels as projection on db.EngineModel;
  entity Engines as projection on db.Engine;
  entity Technicians as projection on db.Technician;
  entity Organizations as projection on db.Organization;

}