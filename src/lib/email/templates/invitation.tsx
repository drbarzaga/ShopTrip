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

interface InvitationEmailProps {
  organizationName: string;
  inviterName: string;
  invitationLink: string;
  role?: string;
}

export function InvitationEmail({
  organizationName,
  inviterName,
  invitationLink,
  role = "miembro",
}: InvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>ShopTrip</Text>
          </Section>
          
          <Section style={content}>
            <Text style={title}>¡Has sido invitado a unirte a una organización!</Text>
            
            <Text style={text}>
              Hola,
            </Text>
            
            <Text style={text}>
              <strong>{inviterName}</strong> te ha invitado a unirte a la organización{" "}
              <strong>{organizationName}</strong> como <strong>{role}</strong>.
            </Text>
            
            <Text style={text}>
              Acepta esta invitación para comenzar a colaborar en viajes y listas de compras compartidas.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={invitationLink}>
                Aceptar Invitación
              </Button>
            </Section>
            
            <Text style={textSmall}>
              O copia y pega este enlace en tu navegador:
            </Text>
            <Text style={link}>{invitationLink}</Text>
            
            <Text style={textSmall}>
              Esta invitación expirará en 7 días.
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              Si no esperabas esta invitación, puedes ignorar este correo.
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
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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

