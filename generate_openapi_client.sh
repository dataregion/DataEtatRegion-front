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
# XXX: Fix des types, sinon le generateur ne produit pas les champs dans le model
#
fix_swagger_json_take_firstof_type() {
  json_f="$1"
  temp_f=$(mktemp)

  echo >&2 "Corrige le fichier swagger en simplifiant les types. tous les types de forme 'type': ['type1', 'type2'] => 'type': 'type1'"
  echo >&2 "(Oui, c'est nécessaire pour que le générateur s'y retrouve....)"

  cp -a "$json_f" "$temp_f"
  # jq 'walk(if type == "object" and .type then .type |= .[0] else . end)' "$temp_f" > "$json_f"
  jq 'walk(if type == "object" and has("type") and (.type | type) == "array" then .type |= .[0] else . end)' "$temp_f" > "$json_f"
  
  echo >&2 "Fichier sauvegardé ici: '$json_f'"
}

#
# XXX: Fix pour l'utilisation de Bearer au lieu de OAuth2AuthorizationCodeBearer 
#
fix_swagger_json_replace_oauth() {
  json_f="$1"
  temp_f=$(mktemp)

  echo >&2 "Corrige le fichier swagger en remplaçant l'utilisation de 'OAuth2AuthorizationCodeBearer' par 'Bearer'"

  cp -a "$json_f" "$temp_f"
  sed -i 's/"OAuth2AuthorizationCodeBearer": \[\]/"Bearer": \[\]/g' "$temp_f"
  cp "$temp_f" "$json_f"

  echo >&2 "Fichier sauvegardé ici: '$json_f'"
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
fix_swagger_json_take_firstof_type "$temp_swagger"
fix_swagger_json_replace_oauth "$temp_swagger"

# /tmp/tmp.43nywMtczG/swagger.json
# temp_swagger="/home/rog/DEV_SGAR/front-data/tmp-swagger.json"
#
# Génère l'api
#
docker run \
  --user 1000:1000 \
  -v "$target_abs":/local -v "$temp_swagger":/tmp/swagger.json openapitools/openapi-generator-cli:v7.12.0 generate \
  -i "/tmp/swagger.json" \
  -g typescript-angular \
  -o "/local/$nom_api" \
  --additional-properties npmName=$nom_api,npmVersion=1.0.0,snapshot=false,ngVersion="19.0.0",rxjsVersion="7.5.5",tsVersion="<5.7.4",apiModulePrefix="$prefix",configurationPrefix="$prefix,withInterfaces=true"