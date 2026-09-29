import { RocketMessage } from "@/components/RocketMessage";

export default function NotFound() {
  return (
    <RocketMessage kicker="404" title="This page didn’t launch." primary={{ href: "/", label: "Back to Axiom" }}>
      <p>The link is old or the page moved. Everything worth finding is one tap away.</p>
    </RocketMessage>
  );
}
