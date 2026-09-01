#!/bin/sh

set -eu

visitor_ip_hash_key="${VISITOR_IP_HASH_KEY:-}"

if [ "${#visitor_ip_hash_key}" -ne 64 ]; then
  printf '%s\n' 'VISITOR_IP_HASH_KEY must contain exactly 64 hexadecimal characters.' >&2
  exit 1
fi

case "${visitor_ip_hash_key}" in
  *[!0-9a-fA-F]*)
    printf '%s\n' 'VISITOR_IP_HASH_KEY must contain exactly 64 hexadecimal characters.' >&2
    exit 1
    ;;
esac

data_directory="/app/data"
mapping_file="${data_directory}/mapping.csv"
results_file="${data_directory}/results.csv"

mkdir -p "${data_directory}"

if [ ! -s "${mapping_file}" ]; then
  printf '%s\n' 'code,name,phone' > "${mapping_file}"
fi

if [ ! -s "${results_file}" ]; then
  printf '%s\n' 'name,phone,code,course,timestamp' > "${results_file}"
fi

chown node:node "${data_directory}" "${mapping_file}" "${results_file}"
chmod 0755 "${data_directory}"
chmod 0644 "${mapping_file}" "${results_file}"

for visitor_database_file in "${data_directory}"/visitors.sqlite*; do
  if [ ! -e "${visitor_database_file}" ]; then
    continue
  fi

  chown node:node "${visitor_database_file}"
  chmod 0600 "${visitor_database_file}"
done

exec su-exec node:node "$@"
