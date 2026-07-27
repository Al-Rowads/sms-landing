#!/bin/sh

set -eu

data_directory="/app/data"
mapping_file="${data_directory}/mapping.csv"
results_file="${data_directory}/results.csv"

mkdir -p "${data_directory}"

if [ ! -s "${mapping_file}" ]; then
  printf '%s\n' 'code,name,phone' > "${mapping_file}"
fi

if [ ! -s "${results_file}" ]; then
  printf '%s\n' 'name,phone,code,timestamp' > "${results_file}"
fi

chown node:node "${data_directory}" "${mapping_file}" "${results_file}"
chmod 0755 "${data_directory}"
chmod 0644 "${mapping_file}" "${results_file}"

exec su-exec node:node "$@"
