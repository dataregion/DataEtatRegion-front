#!/bin/bash

# Fonction pour afficher le message d'aide
display_help() {
  echo "Usage: $0 [-s swagger_url] [-p prefix] [-t target] [argument]"
  echo
  echo "Options:"
  echo "  -s swagger_url   Spécifier l'URL Swagger"
  echo "  -p prefix        Spécifier un préfixe"
  echo "  -t target   Spécifier le nom du dossier"
  echo "  -n nom      Spécifier le nom de l'api"
  echo
  exit 1
}

# Déclaration des options par défaut
swagger_url=""
prefix=""
target=""
nom_api=""
argument=""

# Utilisation de getopts pour analyser les options
while getopts ":s:p:t:n:" opt; do
  case $opt in
    s)
      swagger_url="$OPTARG"
      ;;
    p)
      prefix="$OPTARG"
      ;;
    t)
      target="$OPTARG"
      ;;
    n)
      nom_api="$OPTARG"
      ;;
    \?)
      echo "Option invalide: -$OPTARG" >&2
      display_help
      ;;
    :)
      echo "L'option -$OPTARG nécessite un argument." >&2
      display_help
      ;;
  esac
done

# Shift pour ignorer les options analysées
shift $((OPTIND-1))

# Affichage des résultats
echo "Swagger URL: $swagger_url"
echo "Préfixe: $prefix"
echo "Nom du dossier: $target"
echo "Nom de l'API: $nom_api"
echo "Argument: $argument"

if [ -z "$swagger_url"  ]; then
  echo "L'option -s est obligatoire"
  display_help
fi
if [ -z "$prefix"  ]; then
  echo "L'option -p est obligatoire"
  display_help
fi
if [ -z "$target"  ]; then
  echo "L'option -t est obligatoire"
  display_help
fi
if [ -z "$nom_api"  ]; then
  echo "L'option -n est obligatoire"
  display_help
fi

confirm() {
  read -n 1 answer
  if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
    echo 'Y'
  else
    echo 'N'
  fi
}

#
# "corrige" un fichier json swagger
# en retirant toutes les clefs "additionalProperties"
# 
# XXX: En effet, le generator n'aime pas cette proprieté et ignore la generation du modele si cette proprieté est à false.
#
fix_swagger_json_remove_additionalProperties() {
  

  json_f="$1"
  temp_f=$(mktemp)

  echo >&2 "Corrige le fichier swagger en retirant toutes les occurences de 'additionalProperties..."

  cp -a "$json_f" "$temp_f"
  jq 'walk(if type == "object" then del(.additionalProperties) else . end)' "$temp_f" > "$json_f"
}

#
# Prépare le dossier target
#
mkdir -p "$target/$nom_api" || true

target_abs=$(realpath "$target")
target_api=$(realpath "$target_abs"/"$nom_api")
echo >&2 "Le dossier '$target_api' sera utilisé et son contenu remplacé. [y/N]"
answer="$(confirm)"
if [ "$answer" == "N" ]; then
  exit 1
fi

rm -rf "$target_api"

#
# Prépare le swagger
#
temp_swagger_d=$(mktemp -d )
temp_swagger="$temp_swagger_d/swagger.json"
curl -o "$temp_swagger" "$swagger_url" 2> /dev/null

echo >&2 "Swagger téléchargé dans $temp_swagger. Générer l'API. [y/N]"
answer="$(confirm)"
if [ "$answer" == "N" ]; then
  exit 1
fi

#
# Applique les fixes si nécessaire
#
fix_swagger_json_remove_additionalProperties "$temp_swagger"

#
# Génère l'api
#
docker run --rm \
  --user 1000:1000 \
  -v "$target_abs":/local -v "$temp_swagger":/tmp/swagger.json openapitools/openapi-generator-cli generate \
  -i "/tmp/swagger.json" \
  -g typescript-angular \
  -o "/local/$nom_api" \
  --additional-properties npmName=$nom_api,npmVersion=1.0.0,snapshot=false,ngVersion="15.0.1",apiModulePrefix="$prefix",configurationPrefix="$prefix,withInterfaces=true"