import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Personas } from './personas/entities/persona.entity';
import { Usuarios } from './usuarios/entities/usuario.entity';
import { RolUsuario, EstadoUsuario } from './compartido/enums';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const personaRepository = dataSource.getRepository(Personas);
  const usuarioRepository = dataSource.getRepository(Usuarios);
  
  // Buscar o crear la Persona
  let persona = await personaRepository.findOne({ where: { ci: '00000000' } });
  if (!persona) {
    persona = personaRepository.create({
      nombre: 'Admin',
      apellido: 'administrador',
      ci: '00000000',
      telefono: '00000000',
      email: 'admin@test.com',
    });
    await personaRepository.save(persona);
    console.log('Persona Dasca creada.');
  } else {
    console.log('Persona Dasca ya existe.');
  }
  
  // Buscar o crear el Usuario
  let usuario = await usuarioRepository.findOne({ where: { correo: 'admin@test.com' } });
  if (!usuario) {
    const contrasena_hash = await bcrypt.hash('12345678', 10);
    
    usuario = usuarioRepository.create({
      correo: 'admin@test.com',
      contrasena_hash,
      roles: [RolUsuario.ADMINISTRADOR, RolUsuario.DIRECTOR],
      estado: EstadoUsuario.ACTIVO,
      persona: persona,
    });
    await usuarioRepository.save(usuario);
    console.log('Usuario Super Administrador Dasca creado exitosamente.');
  } else {
    console.log('Usuario Super Administrador Dasca ya existe.');
  }
  
  await app.close();
}

bootstrap();
