import * as jf from "joiful";

export class User {
  @(jf.string().required())
  name: string;
}

export class Addresses {
  @(jf.string().required())
  address: string;
  @(jf.number().integer().required())
  telephone: number;
}

export class DataMsg {
  @(jf.object().required())
  user: User;
  @jf.array({ elementClass: Addresses })
  addresses: Array<Addresses>;
}
