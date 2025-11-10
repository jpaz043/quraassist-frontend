# 🏥 Backend Developer Guide - Cura Medical Platform

## 📋 Project Overview

### Mission
Desarrollar el backend robusto para la plataforma PWA médica que revolucionará la práctica médica en Honduras. Este backend debe ser **ultra-confiable**, **seguro** y **escalable** para manejar información médica crítica.

### Tech Stack Requirements
- **NestJS 10+** con TypeScript estricto
- **PostgreSQL 15+** como base de datos principal
- **TypeORM** para gestión de base de datos
- **JWT + Guards** para seguridad
- **Swagger** para documentación automática
- **Twilio API** para WhatsApp
- **Stripe Subscriptions** para pagos
- **AWS Lightsail** para hosting

---

## 🏗️ Architecture Overview

### Folder Structure (SOLID Principles)
```
src/
├── auth/                   # 🔐 Autenticación y autorización
│   ├── dto/               # DTOs para login, registro, tokens
│   ├── guards/            # AuthGuard, RolesGuard, ThrottleGuard
│   ├── strategies/        # JWT Strategy, Local Strategy
│   └── auth.service.ts    # Lógica de autenticación
│
├── medicos/               # 👨‍⚕️ Gestión de médicos
│   ├── entities/          # Médico Entity (TypeORM)
│   ├── dto/              # CreateMedicoDto, UpdateMedicoDto
│   ├── medicos.controller.ts
│   └── medicos.service.ts
│
├── pacientes/             # 👥 Gestión de pacientes  
│   ├── entities/          # Paciente Entity
│   ├── dto/              # CreatePacienteDto, ConsentimientoDto
│   ├── pacientes.controller.ts
│   └── pacientes.service.ts
│
├── citas/                 # 📅 Agenda y citas médicas
│   ├── entities/          # Cita Entity, EstadoCita enum
│   ├── dto/              # CreateCitaDto, UpdateCitaDto
│   ├── citas.controller.ts
│   └── citas.service.ts
│
├── mensajes/              # 📱 WhatsApp y comunicaciones
│   ├── dto/              # SendMessageDto, MessageTemplateDto
│   ├── services/         # TwilioService, WhatsappService
│   ├── mensajes.controller.ts
│   └── mensajes.service.ts
│
├── tokens/                # 💰 Sistema de créditos/tokens
│   ├── entities/          # Token Entity, TokenTransaction
│   ├── dto/              # ConsumeTokenDto, PurchaseTokenDto
│   ├── tokens.controller.ts
│   └── tokens.service.ts
│
├── suscripciones/         # 💳 Stripe y planes
│   ├── entities/          # Subscription Entity, Plan Entity
│   ├── dto/              # CreateSubscriptionDto, WebhookDto
│   ├── services/         # StripeService
│   ├── suscripciones.controller.ts
│   └── suscripciones.service.ts
│
├── common/                # 🔧 Utilidades compartidas
│   ├── decorators/       # @ApiResponse, @Auth, @GetUser
│   ├── filters/          # GlobalExceptionFilter
│   ├── interceptors/     # LoggingInterceptor, TransformInterceptor
│   ├── pipes/            # ValidationPipe personalizado
│   └── constants/        # Constantes globales
│
└── config/               # ⚙️ Configuraciones
    ├── database.config.ts
    ├── jwt.config.ts
    ├── stripe.config.ts
    └── twilio.config.ts
```

---

## 🎯 Core Entities & Relationships

### 1. Médico Entity
```typescript
@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hasheado con bcrypt

  @Column()
  nombreCompleto: string;

  @Column()
  especialidad: string;

  @Column()
  numeroLicencia: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 100 })
  tokensDisponibles: number;

  @OneToMany(() => Paciente, paciente => paciente.medico)
  pacientes: Paciente[];

  @OneToMany(() => Cita, cita => cita.medico)
  citas: Cita[];

  @OneToOne(() => Suscripcion, suscripcion => suscripcion.medico)
  suscripcion: Suscripcion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 2. Paciente Entity
```typescript
@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombreCompleto: string;

  @Column()
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date' })
  fechaNacimiento: Date;

  @Column({ default: false })
  consentimientoWhatsApp: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaConsentimiento: Date;

  @ManyToOne(() => Medico, medico => medico.pacientes)
  medico: Medico;

  @OneToMany(() => Cita, cita => cita.paciente)
  citas: Cita[];

  @Column('simple-array', { nullable: true })
  etiquetas: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3. Cita Entity
```typescript
export enum EstadoCita {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  NO_ASISTIO = 'no_asistio'
}

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  fechaHora: Date;

  @Column({ type: 'int', default: 30 })
  duracionMinutos: number;

  @Column({
    type: 'enum',
    enum: EstadoCita,
    default: EstadoCita.PENDIENTE
  })
  estado: EstadoCita;

  @Column({ nullable: true })
  motivo: string;

  @Column({ nullable: true })
  notas: string;

  @ManyToOne(() => Medico, medico => medico.citas)
  medico: Medico;

  @ManyToOne(() => Paciente, paciente => paciente.citas)
  paciente: Paciente;

  @Column({ default: false })
  recordatorioEnviado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaRecordatorio: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 🚨 Critical Security Requirements

### 1. Authentication & Authorization
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // 1. Validate credentials
    // 2. Generate JWT tokens (access + refresh)
    // 3. Log authentication event
    // 4. Return user data + tokens
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // 1. Validate refresh token
    // 2. Generate new access token
    // 3. Optionally rotate refresh token
  }
}

// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  }
}
```

### 2. Data Validation & DTOs
```typescript
// create-paciente.dto.ts
export class CreatePacienteDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  nombreCompleto: string;

  @IsNotEmpty()
  @IsPhoneNumber('HN') // Honduras phone validation
  telefono: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsBoolean()
  consentimientoWhatsApp: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  etiquetas?: string[];
}
```

### 3. Rate Limiting & Throttling
```typescript
// Rate limiting configuration
@Controller('api/v1/mensajes')
@UseGuards(JwtAuthGuard)
@Throttle(10, 60) // 10 requests per minute
export class MensajesController {
  
  @Post('send-reminder')
  @Throttle(5, 60) // More restrictive for WhatsApp
  async sendReminder(@Body() dto: SendReminderDto) {
    // Send WhatsApp reminder logic
  }
}
```

---

## 📱 WhatsApp Integration (Twilio)

### Service Implementation
```typescript
@Injectable()
export class WhatsappService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    this.twilioClient = twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendReminder(
    to: string, 
    template: MessageTemplate, 
    variables: MessageVariables
  ): Promise<MessageResult> {
    try {
      // 1. Validate phone number format
      // 2. Check consent for WhatsApp
      // 3. Consume token from médico account
      // 4. Send message via Twilio
      // 5. Log message delivery
      // 6. Return result with tracking ID

      const message = await this.twilioClient.messages.create({
        from: 'whatsapp:+14155238886', // Twilio Sandbox
        to: `whatsapp:+504${to}`, // Honduras format
        body: this.buildMessage(template, variables)
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status
      };
    } catch (error) {
      // Handle Twilio errors appropriately
      throw new BadRequestException('Error sending WhatsApp message');
    }
  }
}
```

### Message Templates by Specialty
```typescript
export const MessageTemplates = {
  MEDICINA_GENERAL: {
    RECORDATORIO_24H: `🏥 *Recordatorio de Cita*\n\nHola {{nombrePaciente}},\n\nTe recordamos tu cita médica:\n📅 {{fecha}}\n🕒 {{hora}}\n👨‍⚕️ Dr. {{nombreMedico}}\n\n¿Podrás asistir? Responde:\n✅ SÍ para confirmar\n❌ NO para reagendar`,
    
    CONFIRMACION: `✅ *Cita Confirmada*\n\nGracias {{nombrePaciente}}, tu cita está confirmada:\n📅 {{fecha}} a las {{hora}}\n\nTe esperamos! 🏥`
  },
  
  ODONTOLOGIA: {
    RECORDATORIO_24H: `🦷 *Recordatorio Dental*\n\nHola {{nombrePaciente}},\n\nTu cita dental es:\n📅 {{fecha}}\n🕒 {{hora}}\n🦷 Dr. {{nombreMedico}}\n\n⚠️ Recuerda cepillarte antes de venir\n\n¿Confirmas tu asistencia?\n✅ SÍ ❌ NO`
  }
};
```

---

## 💳 Stripe Integration

### Subscription Plans
```typescript
export enum PlanType {
  BASICO = 'basico',
  PREMIUM = 'premium'
}

@Entity('planes')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "Plan Básico", "Plan Premium"

  @Column({
    type: 'enum',
    enum: PlanType
  })
  type: PlanType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number; // 25.00, 45.00

  @Column({ type: 'int' })
  tokensIncluidos: number; // 100, 300

  @Column()
  stripeProductId: string;

  @Column()
  stripePriceId: string;
}
```

### Stripe Service
```typescript
@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY'),
      { apiVersion: '2023-10-16' }
    );
  }

  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async handleWebhook(
    payload: string,
    signature: string
  ): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET')
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
    }
  }
}
```

---

## 🔐 Token System Implementation

### Token Management
```typescript
@Injectable()
export class TokensService {
  async consumeTokens(
    medicoId: string, 
    cantidad: number, 
    concepto: string
  ): Promise<boolean> {
    const medico = await this.medicosService.findOne(medicoId);
    
    if (medico.tokensDisponibles < cantidad) {
      throw new BadRequestException('Tokens insuficientes');
    }

    // Atomic operation
    await this.dataSource.transaction(async manager => {
      // 1. Reduce tokens from médico
      await manager.update(Medico, medicoId, {
        tokensDisponibles: medico.tokensDisponibles - cantidad
      });

      // 2. Log transaction
      await manager.save(TokenTransaction, {
        medico: { id: medicoId },
        cantidad: -cantidad,
        concepto,
        tipo: 'CONSUMO'
      });
    });

    return true;
  }

  async addTokens(
    medicoId: string,
    cantidad: number,
    concepto: string
  ): Promise<void> {
    await this.dataSource.transaction(async manager => {
      await manager.increment(
        Medico,
        { id: medicoId },
        'tokensDisponibles',
        cantidad
      );

      await manager.save(TokenTransaction, {
        medico: { id: medicoId },
        cantidad,
        concepto,
        tipo: 'RECARGA'
      });
    });
  }
}
```

---

## 📊 API Endpoints Specification

### 1. Authentication Endpoints
```typescript
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### 2. Médicos Management
```typescript
GET    /api/v1/medicos/profile
PUT    /api/v1/medicos/profile
GET    /api/v1/medicos/dashboard-stats
GET    /api/v1/medicos/tokens/balance
```

### 3. Pacientes Management
```typescript
GET    /api/v1/pacientes?page=1&limit=20&search=
POST   /api/v1/pacientes
GET    /api/v1/pacientes/:id
PUT    /api/v1/pacientes/:id
DELETE /api/v1/pacientes/:id
POST   /api/v1/pacientes/:id/consent-whatsapp
```

### 4. Citas Management
```typescript
GET    /api/v1/citas?fecha=2024-01-15&estado=pendiente
POST   /api/v1/citas
GET    /api/v1/citas/:id
PUT    /api/v1/citas/:id
DELETE /api/v1/citas/:id
PUT    /api/v1/citas/:id/estado
GET    /api/v1/citas/agenda/week?fecha=2024-01-15
```

### 5. Mensajes/WhatsApp
```typescript
POST   /api/v1/mensajes/send-reminder
POST   /api/v1/mensajes/bulk-reminders
GET    /api/v1/mensajes/templates/:especialidad
POST   /api/v1/mensajes/webhook/twilio
GET    /api/v1/mensajes/history/:pacienteId
```

### 6. Tokens & Billing
```typescript
GET    /api/v1/tokens/balance
GET    /api/v1/tokens/transactions
POST   /api/v1/tokens/purchase
```

### 7. Subscriptions
```typescript
GET    /api/v1/suscripciones/plans
POST   /api/v1/suscripciones/create
GET    /api/v1/suscripciones/current
POST   /api/v1/suscripciones/cancel
POST   /api/v1/suscripciones/webhook/stripe
```

---

## 🔧 Environment Variables

### Required Environment Variables
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=cura_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=cura_medical

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
PORT=3000
NODE_ENV=development
API_VERSION=v1
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload (future)
MAX_FILE_SIZE=5MB
UPLOAD_DEST=./uploads
```

---

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// medicos.service.spec.ts
describe('MedicosService', () => {
  it('should create a médico with hashed password', async () => {
    const createDto = {
      email: 'doctor@test.com',
      password: 'plainPassword',
      nombreCompleto: 'Dr. Test'
    };

    const result = await service.create(createDto);
    
    expect(result.password).not.toBe(createDto.password);
    expect(result.email).toBe(createDto.email);
  });

  it('should consume tokens correctly', async () => {
    const medico = await service.findOne('uuid');
    const initialTokens = medico.tokensDisponibles;
    
    await service.consumeTokens(medico.id, 5, 'WhatsApp reminder');
    
    const updatedMedico = await service.findOne(medico.id);
    expect(updatedMedico.tokensDisponibles).toBe(initialTokens - 5);
  });
});
```

### 2. Integration Tests
```typescript
// citas.controller.e2e-spec.ts
describe('CitasController (e2e)', () => {
  it('should create appointment and send reminder', async () => {
    const citaDto = {
      pacienteId: 'patient-uuid',
      fechaHora: '2024-01-15T10:00:00Z',
      motivo: 'Consulta general'
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${validJwtToken}`)
      .send(citaDto)
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.estado).toBe('pendiente');
  });
});
```

---

## 🚀 Deployment & DevOps

### 1. Database Migrations
```typescript
// 001-create-medicos-table.ts
export class CreateMedicosTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'medicos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true
          },
          // ... more columns
        ]
      })
    );
  }
}
```

### 2. Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

USER node

CMD ["node", "dist/main"]
```

### 3. AWS Lightsail Deployment
```bash
# deployment script
#!/bin/bash
set -e

echo "🚀 Deploying Cura Backend to AWS Lightsail..."

# Build Docker image
docker build -t cura-backend .

# Push to registry (optional)
# docker tag cura-backend your-registry/cura-backend
# docker push your-registry/cura-backend

# Deploy to Lightsail
# Configure your Lightsail container service
```

---

## 📈 Performance & Monitoring

### 1. Database Optimization
```typescript
// Indexed queries
@Entity('citas')
@Index(['medico', 'fechaHora'])
@Index(['paciente', 'estado'])
export class Cita {
  // ... entity definition
}

// Query optimization
async findAgendaByWeek(
  medicoId: string, 
  startDate: Date, 
  endDate: Date
) {
  return this.citaRepository
    .createQueryBuilder('cita')
    .leftJoinAndSelect('cita.paciente', 'paciente')
    .where('cita.medico = :medicoId', { medicoId })
    .andWhere('cita.fechaHora BETWEEN :start AND :end', {
      start: startDate,
      end: endDate
    })
    .orderBy('cita.fechaHora', 'ASC')
    .getMany();
}
```

### 2. Logging & Monitoring
```typescript
// logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    
    this.logger.log(`${method} ${url} - User: ${user?.email}`);

    return next.handle().pipe(
      tap(data => {
        this.logger.log(`Response sent for ${method} ${url}`);
      })
    );
  }
}
```

---

## ✅ Definition of Done Checklist

### For each API endpoint:
- [ ] TypeScript interfaces and DTOs defined
- [ ] Proper validation with class-validator
- [ ] Error handling implemented
- [ ] JWT authentication required (where applicable)
- [ ] Rate limiting configured
- [ ] Swagger documentation updated
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Database queries optimized
- [ ] Audit logs implemented (for medical data)

### For each feature:
- [ ] Database migrations created
- [ ] Environment variables documented
- [ ] Error scenarios handled gracefully
- [ ] Performance tested under load
- [ ] Security review completed
- [ ] Medical data compliance verified
- [ ] Monitoring and logging configured

---

## 🎯 Success Metrics

### Technical KPIs
- **API Response Time**: < 200ms for 95% of requests
- **Database Query Time**: < 100ms average
- **WhatsApp Delivery Rate**: > 95%
- **System Uptime**: > 99.5%
- **Token Consumption Accuracy**: 100%

### Business KPIs
- **User Registration Time**: < 60 seconds
- **Appointment Creation**: < 30 seconds
- **WhatsApp Reminder Delivery**: < 5 seconds
- **Payment Processing**: < 10 seconds
- **Data Sync Response**: < 2 seconds

---

## 📞 Communication Protocol

### Daily Standups
- **What I did yesterday**: Specific feature/endpoint completed
- **What I'm doing today**: Current task with expected completion
- **Blockers**: Technical dependencies or external API issues

### Code Reviews
- Follow SOLID principles
- Check error handling completeness
- Verify medical data compliance
- Validate security implementation
- Confirm API documentation updates

### Emergency Response
- Critical bugs: < 2 hour response time
- Security issues: < 1 hour response time  
- Data integrity issues: < 30 minutes response time

---

## 🇭🇳 ¡Estamos construyendo el futuro de la medicina en Honduras!

### Remember: Every line of code impacts doctors' daily practice and patients' health outcomes. Code with that responsibility in mind.

**Code Quality = Patient Care Quality** 🏥❤️