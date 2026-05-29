namespace jetbench;

using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

type UserRole : String enum {
      PLATFORM_ADMIN;
      ORG_ADMIN;
      ORG_USER;
}

type OrganizationStatus : String enum {
      ACTIVE;
      SUSPENDED;
      ARCHIVED;
}

type OrganizationType : String enum {
      OWNER_OPERATOR;
      CHARTER_OPERATOR;
      MANAGEMENT_COMPANY;
      MAINTENANCE_SHOP;
      OTHER;
}

type AircraftStatus : String enum {
      ACTIVE;
      INACTIVE;
      MAINTENANCE;
      RETIRED;
}

type EngineStatus : String enum {
      INSTALLED;
      UNINSTALLED;
      MAINTENANCE;
      RETIRED;
}

entity UserRoleCode : CodeList {
      key code : UserRole;
}

entity OrganizationTypeCode : CodeList {
      key code : OrganizationType;
}

entity OrganizationStatusCode : CodeList {
      key code : OrganizationStatus;
}

@assert.unique: { code: [code] }
entity Organization : cuid, managed {
      name                : String(100) not null;
      code                : String(20) not null;
      legalName           : String(160);
      type                : OrganizationType default 'OWNER_OPERATOR';
      country             : String(2);
      city                : String(80);
      timezone            : String(60);
      primaryContactName  : String(120) not null;
      primaryContactEmail : String(120) not null;
      primaryContactPhone : String(40);
      status              : OrganizationStatus default 'ACTIVE';

      users               : Association to many AppUser on users.organization = $self;
      aircraft            : Association to many Aircraft on aircraft.organization = $self;
      engines             : Association to many Engine on engines.organization = $self;
}

@assert.unique: { email: [email] }
entity AppUser : cuid, managed {
      firstName      : String(80) not null;
      lastName       : String(80) not null;
      email          : String(120) not null;
      authId         : String(255);
      role           : UserRole not null;
      isActive       : Boolean default true;

      organization   : Association to Organization not null;
}

@assert.unique: { code: [code] }
entity AircraftModel : cuid, managed {
      code            : String(20) not null;
      name            : String(100) not null;
      manufacturer    : String(100);
      numberOfEngines : Integer not null;
      engineType      : String(20);

      aircraft        : Association to many Aircraft on aircraft.aircraftModel = $self;
}

@assert.unique: { code: [code] }
entity EngineModel : cuid, managed {
      code         : String(20) not null;
      name         : String(100) not null;
      manufacturer : String(100);
      tbo          : Integer not null @assert.range: [1, 10000];
}

@assert.unique: { tailPerOrg: [organization, tailNumber] }
entity Aircraft : cuid, managed {
      tailNumber           : String(20) not null;
      serialNumber         : String(50) not null;

      aircraftModel        : Association to AircraftModel not null;
      defaultEngineModel   : Association to EngineModel;

      totalFlightHours     : Decimal(10,2) default 0;
      totalCycles          : Integer default 0;
      status               : AircraftStatus default 'ACTIVE';

      organization         : Association to Organization not null;
      engines              : Association to many Engine on engines.aircraft = $self;
}

@assert.unique: { serialPerOrg: [organization, engineSerialNumber] }
entity Engine : cuid, managed {
      engineSerialNumber : String(50) not null;
      positionCode       : String(10);

      engineModel        : Association to EngineModel not null;
      aircraft           : Association to Aircraft;

      totalFlightHours   : Decimal(10,2) default 0;
      totalCycles        : Integer default 0;
      status             : EngineStatus default 'UNINSTALLED';

      organization       : Association to Organization not null;
}

