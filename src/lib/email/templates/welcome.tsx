import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from "@react-email/components";

interface WelcomeEmailProps {
  readonly userName: string;
  readonly verificationUrl: string;
  readonly logoUrl: string | null;
  readonly token?: string;
}

export function WelcomeEmail({
  userName,
  verificationUrl,
  logoUrl,
}: WelcomeEmailProps) {

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            {logoUrl ? (
              <Img 
                src={logoUrl} 
                alt="ShopTrip" 
                width="64" 
                height="64" 
                style={logoImage}
              />
            ) : (
              <Text style={logoText}>ShopTrip</Text>
            )}
          </Section>

          <Section style={content}>
            <Text style={title}>¡Bienvenido a ShopTrip!</Text>

            <Text style={text}>Hola {userName},</Text>

            <Text style={text}>
              ¡Gracias por registrarte en ShopTrip! Tu cuenta ha sido creada
              exitosamente.
            </Text>

            <Text style={text}>
              Para activar tu cuenta y comenzar a organizar tus viajes, haz clic
              en el botón de abajo.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Activa tu cuenta
              </Button>
            </Section>

            <Text style={textSmall}>
              O copia y pega este enlace en tu navegador:
            </Text>
            <Text style={link}>{verificationUrl}</Text>

            <Text style={textSmall}>
              Este enlace expirará en 24 horas por seguridad.
            </Text>

            <Text style={textSmall}>
              Si tienes alguna pregunta, no dudes en contactarnos.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Si no creaste esta cuenta, puedes ignorar este correo.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logoSection = {
  padding: "32px 24px",
  textAlign: "center" as const,
};

const logoImage = {
  margin: "0 auto",
  display: "block",
  width: "64px",
  height: "64px",
  objectFit: "contain" as const,
};

const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#000000",
  textAlign: "center" as const,
  margin: "0 auto",
};

const content = {
  padding: "0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  marginBottom: "16px",
};

const textSmall = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#666666",
  marginTop: "24px",
  marginBottom: "8px",
};

const buttonContainer = {
  padding: "27px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const link = {
  fontSize: "14px",
  color: "#0000ee",
  wordBreak: "break-all" as const,
  marginBottom: "16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "24px",
  color: "#666666",
  textAlign: "center" as const,
};

