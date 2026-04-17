Gem::Specification.new do |s|
  s.name        = 'asciidoctor-hello'
  s.version     = '0.1.0'
  s.authors     = ['aetos']
  s.summary     = 'Asciidoctor hello inline macro extension'
  s.files       = Dir['lib/**/*.rb']
  s.require_paths = ['lib']
  s.add_dependency 'asciidoctor', '>= 2.0'
end
