var config = {};

config.devo = {
  'STORAGE_PROJECT': 'devo-pratilipi',
  'STORAGE_BUCKET': 'datastore-archive-2',
  'BIGQUERY_PROJECT': 'devo-pratilipi',
  'BIGQUERY_DATASET': 'Global'
};

config.gamma = {
  'STORAGE_PROJECT': 'pratilipi-157910',
  'STORAGE_BUCKET': 'datastore-archive',
  'BIGQUERY_PROJECT': 'pratilipi-157910',
  'BIGQUERY_DATASET': 'Global'
};

config.prod = config.gamma;

module.exports = config;
