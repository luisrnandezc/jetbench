using { jetbench as db } from '../db/schema';

@(requires: ['ORG_USER', 'ORG_ADMIN'])
service OperationsService {

  function me() returns Users;

  @readonly
  entity AircraftModels as projection on db.AircraftModel
    excluding { aircraft };

  @readonly
  entity EngineModels as projection on db.EngineModel;

  @(
    readonly,
    restrict: [{
      grant: 'READ',
      to: ['ORG_USER', 'ORG_ADMIN'],
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
    status,
    organization,
    aircraftModel : redirected to AircraftModels
  };

  @(
    readonly,
    restrict: [{
      grant: 'READ',
      to: ['ORG_USER', 'ORG_ADMIN'],
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
      )
    }]
  )
  entity Engines as projection on db.Engine {
    ID,
    engineSerialNumber,
    positionCode,
    totalFlightHours,
    totalCycles,
    status,
    organization,
    aircraft : redirected to Aircraft,
    engineModel : redirected to EngineModels
  };

  @restrict: [
    {
      grant: 'CREATE',
      to: ['ORG_USER', 'ORG_ADMIN']
    },
    {
      grant: 'READ',
      to: ['ORG_USER', 'ORG_ADMIN'],
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
      )
    }
  ]
  entity FlightRecords as projection on db.FlightRecord {
    ID,
    flightDate,
    flightHours,
    cycles,
    notes,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    aircraft : redirected to Aircraft,
    organization,
    recordedBy : redirected to Users
  };

  @(
    readonly,
    restrict: [{
      grant: 'READ',
      to: ['ORG_USER', 'ORG_ADMIN'],
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
        and role <> 'PLATFORM_ADMIN'
      )
    }]
  )
  entity Users as projection on db.AppUser {
    ID,
    firstName,
    lastName,
    email,
    role,
    isActive,
    organization
  };

}