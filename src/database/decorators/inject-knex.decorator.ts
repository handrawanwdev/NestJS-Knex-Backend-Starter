import { Inject } from '@nestjs/common';
import { KNEX_CONNECTION } from '../constants/database.constant';

export const InjectKnex = () => Inject(KNEX_CONNECTION);