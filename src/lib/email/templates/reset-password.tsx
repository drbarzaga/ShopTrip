import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  readonly resetLink: string;
  readonly userName?: string;
}

export function ResetPasswordEmail({
  resetLink,
  userName,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>ShopTrip</Text>
          </Section>

          <Section style={content}>
            <Text style={title}>Restablecer tu contraseña</Text>

            <Text style={text}>
              {userName ? `Hola ${userName},` : "Hola,"}
            </Text>

            <Text style={text}>
              Recibimos una solicitud para restablecer la contraseña de tu
              cuenta. Si fuiste tú, haz clic en el botón de abajo para crear una
              nueva contraseña.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Restablecer Contraseña
              </Button>
            </Section>

            <Text style={textSmall}>
              O copia y pega este enlace en tu navegador:
            </Text>
            <Text style={link}>{resetLink}</Text>

            <Text style={textSmall}>
              Este enlace expirará en 1 hora por seguridad.
            </Text>

            <Text style={textSmall}>
              Si no solicitaste restablecer tu contraseña, puedes ignorar este
              correo de forma segura.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Por seguridad, nunca compartas este enlace con nadie.
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

const header = {
  padding: "32px 24px",
  backgroundColor: "#000000",
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
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

