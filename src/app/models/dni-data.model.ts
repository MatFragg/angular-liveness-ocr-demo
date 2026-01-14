export interface DniData {
  numeroDni: string;
  apellidos: string;
  nombres: string;
  fechaNacimiento: string;
  sexo: string;
  nacionalidad: string;
  fechaEmision?: Date;
  fechaVencimiento?: Date;
  fotoPersona?: string;
  frontImageBase64?: string;
  backImageBase64?: string;
}