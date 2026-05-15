using { jetbench as db } from '../db/schema';

service AdminService {

  entity Users as projection on db.AppUser;
  entity Organizations as projection on db.Organization;

}