using { jetbench as db } from '../db/schema';

@(requires: 'ORG_ADMIN')
service OrganizationService {

  function me() returns Users;

  @restrict: [{
    grant: ['READ', 'UPDATE'],
    to: 'ORG_ADMIN'
  }]
  entity Organizations as projection on db.Organization
    excluding { aircraft, engines };

  @restrict: [
    {
      grant: 'CREATE',
      to: 'ORG_ADMIN'
    },
    {
      grant: ['READ', 'UPDATE', 'DELETE'],
      to: 'ORG_ADMIN',
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
        and role <> 'PLATFORM_ADMIN'
      )
    }
  ]
  entity Users as projection on db.AppUser;

  @readonly
  entity AircraftModels as projection on db.AircraftModel
    excluding { aircraft };

  @readonly
  entity EngineModels as projection on db.EngineModel;

  @restrict: [
    {
      grant: 'CREATE',
      to: 'ORG_ADMIN'
    },
    {
      grant: ['READ', 'UPDATE', 'DELETE'],
      to: 'ORG_ADMIN',
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
      )
    }
  ]
  entity Aircraft as projection on db.Aircraft;

  @restrict: [
    {
      grant: 'CREATE',
      to: 'ORG_ADMIN'
    },
    {
      grant: ['READ', 'UPDATE', 'DELETE'],
      to: 'ORG_ADMIN',
      where: (
        exists organization.users[
          authId = $user and isActive = true
        ]
      )
    }
  ]
  entity Engines as projection on db.Engine;

}
