import { IgmsResponse } from "./api.model";

interface IgmsCompany {
  company_uid: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

export interface IgmsCompanyResponse extends IgmsResponse {
  data: IgmsCompany;
}
