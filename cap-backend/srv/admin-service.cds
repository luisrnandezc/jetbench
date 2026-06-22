using { jetbench as db } from '../db/schema';

@(requires: 'PLATFORM_ADMIN')
service AdminService {

  entity Users as projection on db.AppUser;
  entity Organizations as projection on db.Organization;

  entity AircraftModels as projection on db.AircraftModel;
  entity EngineModels as projection on db.EngineModel;

  entity UserRoles as projection on db.UserRoleCode;
  entity OrganizationTypes as projection on db.OrganizationTypeCode;
  entity OrganizationStatuses as projection on db.OrganizationStatusCode;

  entity Aircraft as projection on db.Aircraft {
    ID,
    tailNumber,
    serialNumber,
    totalFlightHours,
    totalCycles,
    status,
    organization,
    aircraftModel : redirected to AircraftModels,
    engines
  };

  entity Engines as projection on db.Engine {
    ID,
    engineSerialNumber,
    positionCode,
    totalFlightHours,
    totalCycles,
    status,
    organization,
    aircraft,
    engineModel : redirected to EngineModels
  };

  function me() returns Users;

}

annotate AdminService.Users with {
  role @Common.ValueList: {
    CollectionPath: 'UserRoles',
    Parameters: [
      {
        $Type: 'Common.ValueListParameterInOut',
        LocalDataProperty: role,
        ValueListProperty: 'code'
      },
      {
        $Type: 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'name'
      }
    ]
  };
};

annotate AdminService.Organizations with {
  type @Common.ValueList: {
    CollectionPath: 'OrganizationTypes',
    Parameters: [
      {
        $Type: 'Common.ValueListParameterInOut',
        LocalDataProperty: type,
        ValueListProperty: 'code'
      },
      {
        $Type: 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'name'
      }
    ]
  };

  status @Common.ValueList: {
    CollectionPath: 'OrganizationStatuses',
    Parameters: [
      {
        $Type: 'Common.ValueListParameterInOut',
        LocalDataProperty: status,
        ValueListProperty: 'code'
      },
      {
        $Type: 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'name'
      }
    ]
  };
};
