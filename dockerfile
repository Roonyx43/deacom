# Use uma imagem PHP com Apache já configurado
FROM php:8.0-apache

# Instala extensões PHP, caso necessário
RUN docker-php-ext-install mysqli

# Copia os arquivos do projeto para o diretório padrão do Apache
COPY . /var/www/html/

# Exponha a porta 80 para o Railway
EXPOSE 80

# Comando para iniciar o Apache quando o container for iniciado
CMD ["apache2-foreground"]
