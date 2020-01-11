# https://github.com/jeremyfa/yaml.js
# cnpm install -yamljs -g

function Yaml-ToJson() {
    Log-Debug "yaml2json --pretty --indentation 2" $Args

    yaml2json --pretty --indentation 2 $Args
}

function Yaml-FromJson() {
    Log-Debug "json2yaml --depth 64 --indentation 2" $Args

    json2yaml --depth 64 --indentation 2 $Args
}