import { Ability, AbilityBuilder } from '@casl/ability';
import { Request } from 'express';

export default class Can {
  public static defineRulesFor = (req: Request) => {
    const permissions = req.permissions; //Get permissions from json payload
    const { can, rules } = new AbilityBuilder(Ability);

    //Loop through permissions and define Casl rules for handling permissions
    permissions.forEach((value: any) => {
      can(value.action, value.subject); //set actions and subject for Casl permission
    });

    return rules;
  };
}
