import knexConfig from '../knexfile.js';
import knex from 'knex';

export default knex(knexConfig);

console.log('Connected to the database!');