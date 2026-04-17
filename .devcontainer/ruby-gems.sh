default_gem_path=$(/usr/local/ruby/bin/ruby -r rubygems -e 'puts Gem.default_path.join(":")')

export GEM_HOME="${HOME}/.gem"
export GEM_PATH="${GEM_HOME}:${default_gem_path}"
export PATH="${GEM_HOME}/bin:${PATH}"
