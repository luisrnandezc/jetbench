using { jetbench as db } from '../db/schema';

service RegistryService {

  entity AircraftModels as projection on db.AircraftModel;

  entity Aircraft as projection on db.Aircraft {
    ID,
    tailNumber,
    serialNumber,
    totalFlightHours,
    totalCycles,
    organization,
    aircraftModel : redirected to AircraftModels
  };

  entity EngineModels as projection on db.EngineModel;

  entity Engines as projection on db.Engine {
    *,
    aircraft    : redirected to Aircraft,
    engineModel : redirected to EngineModels
  };

}