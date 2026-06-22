using { jetbench as db } from '../db/schema';

@(requires: ['ORG_ADMIN', 'ORG_USER'])
service RegistryService {

  @readonly
  entity AircraftModels as projection on db.AircraftModel
    excluding { aircraft };

  @(
    readonly,
    restrict: [{
      grant: 'READ',
      to: ['ORG_ADMIN', 'ORG_USER'],
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
      )
    }]
  )
  entity Aircraft as projection on db.Aircraft {
    ID,
    tailNumber,
    serialNumber,
    totalFlightHours,
    totalCycles,
    organization,
    aircraftModel : redirected to AircraftModels
  };

  @readonly
  entity EngineModels as projection on db.EngineModel;

  @(
    readonly,
    restrict: [{
      grant: 'READ',
      to: ['ORG_ADMIN', 'ORG_USER'],
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
      )
    }]
  )
  entity Engines as projection on db.Engine {
    *,
    aircraft    : redirected to Aircraft,
    engineModel : redirected to EngineModels
  };

}
