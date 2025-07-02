import { z } from 'zod';
import { documentParserSchema, documentParserResponseSchema } from './schema/';

export type DocumentParserResult = z.infer<typeof documentParserSchema>;

export type DocumentParserResponse = z.infer<typeof documentParserResponseSchema>;

