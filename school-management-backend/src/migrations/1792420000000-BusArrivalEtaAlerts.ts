import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusArrivalEtaAlerts1792420000000 implements MigrationInterface {
  name = 'BusArrivalEtaAlerts1792420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bus_arrival_eta_alerts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bus_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "trip_date" date NOT NULL,
        "trip_type" character varying(16) NOT NULL,
        "eta_minutes" integer NOT NULL,
        "sent_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bus_arrival_eta_alerts" PRIMARY KEY ("id"),
        CONSTRAINT "uq_bus_arrival_eta_alert" UNIQUE ("bus_id", "student_id", "trip_date", "trip_type")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bus_arrival_eta_bus_date"
      ON "bus_arrival_eta_alerts" ("bus_id", "trip_date")
    `);

    await queryRunner.query(`
      INSERT INTO notification_template_definitions (
        template_key, display_name, description, channel, audience,
        default_subject, default_body_html, default_body_sms,
        default_subject_ar, default_body_html_ar, default_body_sms_ar,
        factory_subject, factory_body_html, factory_body_sms,
        factory_subject_ar, factory_body_html_ar, factory_body_sms_ar,
        variable_hints
      )
      SELECT
        'bus.approaching',
        'Bus approaching stop',
        'Push/SMS when the bus is about 3–5 minutes from the child’s pickup/drop-off.',
        'both',
        'school',
        '{{studentName}} — bus arriving in ~{{etaMinutes}} min',
        $html$<p>Dear {{recipientName}},</p><p>The bus for <strong>{{studentName}}</strong> is about <strong>{{etaMinutes}}</strong> minutes away ({{busTitle}}).</p>$html$,
        '{{schoolName}}: {{studentName}} — bus ~{{etaMinutes}} min away.',
        'الحافلة تقترب من {{studentName}} خلال ~{{etaMinutes}} دقائق',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>حافلة <strong>{{studentName}}</strong> على بعد حوالي <strong>{{etaMinutes}}</strong> دقائق ({{busTitle}}).</p>$html$,
        '{{schoolName}}: {{studentName}} — الحافلة خلال ~{{etaMinutes}} دقائق.',
        '{{studentName}} — bus arriving in ~{{etaMinutes}} min',
        $html$<p>Dear {{recipientName}},</p><p>The bus for <strong>{{studentName}}</strong> is about <strong>{{etaMinutes}}</strong> minutes away ({{busTitle}}).</p>$html$,
        '{{schoolName}}: {{studentName}} — bus ~{{etaMinutes}} min away.',
        'الحافلة تقترب من {{studentName}} خلال ~{{etaMinutes}} دقائق',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>حافلة <strong>{{studentName}}</strong> على بعد حوالي <strong>{{etaMinutes}}</strong> دقائق ({{busTitle}}).</p>$html$,
        '{{schoolName}}: {{studentName}} — الحافلة خلال ~{{etaMinutes}} دقائق.',
        '[{"name":"studentName","description":"Student name"},{"name":"recipientName","description":"Guardian name"},{"name":"etaMinutes","description":"ETA minutes"},{"name":"busTitle","description":"Bus title"},{"name":"schoolName","description":"School name"}]'::jsonb
      WHERE NOT EXISTS (
        SELECT 1 FROM notification_template_definitions WHERE template_key = 'bus.approaching'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM notification_template_definitions WHERE template_key = 'bus.approaching'`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bus_arrival_eta_alerts"`);
  }
}
