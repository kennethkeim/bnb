import { IgmsResponse } from "./api.model";

interface IgmsHost {
  host_uid: string;
  /** e.g. airgms or airbnb */
  platform_type: string;
  name: string | null;
  thumbnail_url: string | null;
  email: string[];
  phone_number: string[];
}

export interface IgmsHostResponse extends IgmsResponse {
  data: IgmsHost[];
}
