require 'asciidoctor/extensions'

Asciidoctor::Extensions.register do
  inline_macro do
    named :hello
    process do |parent, target, attrs|
      create_inline parent, :quoted, "👋 Hello, #{target}!"
    end
  end
end
