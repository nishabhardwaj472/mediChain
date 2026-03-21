import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, QrCode, Truck, Factory, Store, User, ArrowRight, CheckCircle2, Lock, Eye } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Landing = () => (
  <div className="min-h-screen">
    {/* Navbar */}
    <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Shield className="h-6 w-6 text-primary" />
          <span>MediChain</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost">Login</Button></Link>
          <Link to="/verify"><Button variant="default">Verify Medicine</Button></Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="gradient-hero pt-32 pb-20 px-4">
      <div className="container mx-auto text-center max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight"
        >
          Blockchain Powered Pharmaceutical Supply Chain
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-lg text-primary-foreground/70 max-w-2xl mx-auto"
        >
          Ensure transparency, traceability, and authenticity of medicines from manufacturer to patient. Prevent counterfeit drugs with blockchain verification.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/login"><Button size="lg" className="gap-2">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link to="/verify">
  <Button
    size="lg"
    variant="outline"
    className="gap-2 border-primary-foreground/30 text-black hover:bg-primary-foreground/10"
  >
    <QrCode className="h-4 w-4" /> Verify Medicine
  </Button>
</Link>
        </motion.div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">How MediChain Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Factory, title: "Register", desc: "Manufacturer registers medicine batch on blockchain" },
            { icon: QrCode, title: "QR Code", desc: "Unique QR code generated for each batch" },
            { icon: Truck, title: "Track", desc: "Every handoff recorded immutably on-chain" },
            { icon: CheckCircle2, title: "Verify", desc: "Anyone can scan QR to verify authenticity" },
          ].map((item, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Benefits */}
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">Benefits of Blockchain in Pharma</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: "Tamper-Proof Records", desc: "Immutable blockchain ledger prevents data manipulation" },
            { icon: Eye, title: "Full Transparency", desc: "Complete visibility from manufacturing to delivery" },
            { icon: Shield, title: "Counterfeit Prevention", desc: "Instant verification ensures medicine authenticity" },
          ].map((item, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <item.icon className="h-8 w-8 text-secondary mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Stakeholders */}
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-12">Stakeholders</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Factory, title: "Manufacturer", desc: "Registers batches and generates QR codes" },
            { icon: Truck, title: "Distributor", desc: "Updates shipment records on blockchain" },
            { icon: Store, title: "Pharmacy", desc: "Confirms receipt and verifies authenticity" },
            { icon: User, title: "Consumer", desc: "Scans QR to verify medicine is genuine" },
          ].map((item, i) => (
            <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full gradient-accent flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="gradient-hero py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Shield className="h-5 w-5" />
            <span className="font-bold">MediChain</span>
          </div>
          <p className="text-primary-foreground/60 text-sm text-center">
            Blockchain-powered pharmaceutical supply chain transparency. Built for trust.
          </p>
          <p className="text-primary-foreground/40 text-xs">© 2025 MediChain</p>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
