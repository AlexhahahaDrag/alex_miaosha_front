import { Dayjs } from 'dayjs';
export interface UserDetail {
  id?: number;
  username?: string;
  password?: string;
  gender?: number;
  avatar?: string;
  email?: string;
  birthday?: Dayjs | string;
  mobile?: string;
  summary?: string;
  status?: string;
  nickName?: string;
  qqNumber?: string;
  weChat?: string;
  occupation?: string;
  github?: string;
  gitee?: string;
  person_resume?: string;
}