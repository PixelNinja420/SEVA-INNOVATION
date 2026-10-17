import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Zap,
  Activity,
  BrainCircuit,
  Target,
  Coins,
  ShieldCheck,
  TrendingDown,
  Sun,
  BatteryCharging,
  Cpu,
  ArrowRight,
  Server,
  Layers,
  Database,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F2E9] text-[#191919]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E3DED2] bg-[#F5F2E9]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#171D22] text-[#7F9565] shadow-xs">
              <Zap className="h-6 w-6 fill-[#368F8A] text-[#7F9565]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight leading-none">
                <span className="text-[#7F9565]">Urja</span>
                <span className="text-[#368F8A]">-Sync</span>
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase mt-0.5">
                Distribution Transformer Protection
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#6B7280]">
            <a href="#problem" className="hover:text-[#191919] transition-colors">
              The Evening Peak
            </a>
            <a href="#how-it-works" className="hover:text-[#191919] transition-colors">
              How It Works
            </a>
            <a href="#technology" className="hover:text-[#191919] transition-colors">
              Dual-Engine AI
            </a>
            <a href="#impact" className="hover:text-[#191919] transition-colors">
              Impact & ROI
            </a>
            <a href="#architecture" className="hover:text-[#191919] transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="teal" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-white/80 border border-[#E3DED2] px-3 py-1.5 rounded-full shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#E56F59] animate-pulse" />
                <span className="text-xs font-semibold text-[#6B7F52] uppercase tracking-wide">
                  Distribution Grid Intelligence Platform
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#191919] leading-[1.1]">
                Protecting Transformers.{' '}
                <span className="text-[#7F9565]">Powering Communities.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#6B7280] leading-relaxed max-w-2xl font-normal">
                Urja-Sync shields distribution transformers from catastrophic thermal failure
                by combining <strong className="text-[#191919] font-semibold">LightGBM predictive forecasting</strong> with{' '}
                <strong className="text-[#191919] font-semibold">0/1 Knapsack demand response</strong>, rewarding consumers with Urja Coins.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/simulation">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Cpu className="w-5 h-5" />}
                    className="shadow-md"
                  >
                    Launch Live Simulation
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg">
                    Explore Platform
                  </Button>
                </Link>
              </div>

              {/* Quick Key Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E3DED2]/80">
                <div>
                  <p className="text-2xl font-bold text-[#191919]">15 Mins</p>
                  <p className="text-xs text-[#6B7280]">AI Early Warning Horizon</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#7F9565]">0/1 Knapsack</p>
                  <p className="text-xs text-[#6B7280]">Minimal Cost Optimization</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#368F8A]">₹4 Lakh</p>
                  <p className="text-xs text-[#6B7280]">Est. Saved per Prevented Failure</p>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Hero Visualizer */}
            <div className="lg:col-span-5">
              <Card variant="dark" className="relative p-6 border-[#2D3640] shadow-2xl overflow-hidden">
                {/* Glowing status header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#2D3640] mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E56F59] animate-ping" />
                    <span className="text-xs font-mono font-semibold text-gray-200">
                      LIVE GRID TELEMETRY: PAN-DT-01
                    </span>
                  </div>
                  <Badge variant="critical" size="sm">
                    WATCH: 98.4% LOAD
                  </Badge>
                </div>

                {/* SVG Architecture Diagram with flowing electricity indicators */}
                <div className="relative py-4">
                  <svg className="w-full h-48" viewBox="0 0 360 180" fill="none">
                    {/* Grid Connection Lines */}
                    <line x1="180" y1="45" x2="60" y2="135" stroke="#368F8A" strokeWidth="2.5" strokeDasharray="4 3" />
                    <line x1="180" y1="45" x2="180" y2="135" stroke="#7F9565" strokeWidth="2.5" strokeDasharray="4 3" />
                    <line x1="180" y1="45" x2="300" y2="135" stroke="#E56F59" strokeWidth="2.5" strokeDasharray="4 3" />

                    {/* Central Transformer Hub */}
                    <g transform="translate(145, 10)">
                      <rect width="70" height="70" rx="14" fill="#1E252C" stroke="#7F9565" strokeWidth="2" />
                      <circle cx="35" cy="35" r="22" stroke="#368F8A" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="35" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                        DT-101
                      </text>
                      <text x="35" y="46" textAnchor="middle" fill="#7F9565" fontSize="8" fontWeight="bold">
                        100 kVA
                      </text>
                    </g>

                    {/* Solar PV Node */}
                    <g transform="translate(30, 115)">
                      <circle cx="30" cy="30" r="24" fill="#1E252C" stroke="#E5A23D" strokeWidth="1.5" />
                      <text x="30" y="27" textAnchor="middle" fill="#E5A23D" fontSize="8" fontWeight="bold">
                        Solar PV
                      </text>
                      <text x="30" y="39" textAnchor="middle" fill="#9CA3AF" fontSize="7">
                        -85% Sunset
                      </text>
                    </g>

                    {/* Smart Homes Node */}
                    <g transform="translate(150, 115)">
                      <circle cx="30" cy="30" r="24" fill="#1E252C" stroke="#7F9565" strokeWidth="1.5" />
                      <text x="30" y="27" textAnchor="middle" fill="#7F9565" fontSize="8" fontWeight="bold">
                        68 Homes
                      </text>
                      <text x="30" y="39" textAnchor="middle" fill="#9CA3AF" fontSize="7">
                        Flexible DR
                      </text>
                    </g>

                    {/* EV Fast Charger Node */}
                    <g transform="translate(270, 115)">
                      <circle cx="30" cy="30" r="24" fill="#1E252C" stroke="#E56F59" strokeWidth="1.5" />
                      <text x="30" y="27" textAnchor="middle" fill="#E56F59" fontSize="8" fontWeight="bold">
                        EV Chargers
                      </text>
                      <text x="30" y="39" textAnchor="middle" fill="#9CA3AF" fontSize="7">
                        +18.2 kW Peak
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Real-time telemetry gauge meters */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#2D3640] text-center">
                  <div className="bg-[#1E252C] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 font-mono">LOADING</p>
                    <p className="text-base font-bold text-[#E56F59]">98.4%</p>
                  </div>
                  <div className="bg-[#1E252C] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 font-mono">OIL TEMP</p>
                    <p className="text-base font-bold text-[#E5A23D]">88.5°C</p>
                  </div>
                  <div className="bg-[#1E252C] p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 font-mono">RISK</p>
                    <p className="text-base font-bold text-[#D94F45]">CRITICAL</p>
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded-lg bg-[#368F8A]/10 border border-[#368F8A]/30 flex items-center justify-between text-xs">
                  <span className="text-gray-300">Knapsack DR Target:</span>
                  <span className="font-bold text-[#368F8A]">Shed 17.4 kW (5 Consumers)</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section: The Evening Peak Duck Curve */}
      <section id="problem" className="py-20 bg-white border-y border-[#E3DED2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="warning" className="mb-3">
              THE GRID CRISIS
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191919] tracking-tight">
              The 6:30 PM Duck Curve Bottleneck
            </h2>
            <p className="mt-4 text-base text-[#6B7280] leading-relaxed">
              When the sun sets, distributed solar drops rapidly while household demand, air conditioning, and EV charging ramp up simultaneously. The resulting thermal surge stresses aging distribution transformers to the brink of failure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-[#E3DED2] bg-[#F5F2E9]/40">
              <div className="p-3 bg-[#E5A23D]/15 rounded-xl w-fit text-[#E5A23D] mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191919] mb-2">1. Rapid Solar Cliff</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Rooftop solar generation collapses between 5:30 PM and 6:30 PM, removing thousands of distributed kilowatts that were previously supporting local voltage and load.
              </p>
            </Card>

            <Card className="p-6 border-[#E3DED2] bg-[#F5F2E9]/40">
              <div className="p-3 bg-[#E56F59]/15 rounded-xl w-fit text-[#E56F59] mb-4">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191919] mb-2">2. Uncoordinated EV & HVAC Surge</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Commuters plug in EV chargers (3.3–7.2 kW each) and switch on cooling/water geysers simultaneously, concentrating heavy inductive loads on residential feeders.
              </p>
            </Card>

            <Card className="p-6 border-[#E3DED2] bg-[#F5F2E9]/40">
              <div className="p-3 bg-[#D94F45]/15 rounded-xl w-fit text-[#D94F45] mb-4">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#191919] mb-2">3. Transformer Thermal Degradation</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Transformer winding temperature exceeds 95°C. Oil insulation deteriorates exponentially, triggering feeder breaker trips, local blackouts, or complete transformer explosions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section id="how-it-works" className="py-20 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" className="mb-3">
              INTELLIGENT WORKFLOW
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191919] tracking-tight">
              4 Steps to Resilient Transformer Protection
            </h2>
            <p className="mt-4 text-base text-[#6B7280]">
              From telemetry stream to verified consumer load curtailment in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="p-6 relative bg-white border-[#E3DED2] shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#7F9565] text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-[#191919] mb-2">Monitor</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Continuous MQTT / IoT telemetry ingests active kW, 3-phase current, top-oil temp, and harmonics every 5 seconds.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 relative bg-white border-[#E3DED2] shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#368F8A] text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-[#191919] mb-2">Predict</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                LightGBM regression forecasts load 15 minutes ahead, flagging imminent overloads before thermal damage occurs.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 relative bg-white border-[#E3DED2] shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#E56F59] text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-[#191919] mb-2">Optimize</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                0/1 Knapsack dynamic programming selects the exact minimal subset of flexible consumer appliances to curtail.
              </p>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 relative bg-white border-[#E3DED2] shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#24845B] text-white flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-[#191919] mb-2">Reward</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Consumers automatically earn Urja Coins redeemable on electricity bills, creating a self-sustaining flexibility ecosystem.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Dual Engine AI Technology Section */}
      <section id="technology" className="py-20 bg-white border-y border-[#E3DED2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="info">DUAL-ENGINE CORE</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191919] tracking-tight">
                Two Complementary AI Engines Working in Harmony
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                Unlike primitive threshold alarms or brute-force rolling blackouts, Urja-Sync pairs machine learning predictive foresight with mathematically optimal demand dispatch.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2 rounded-lg bg-[#368F8A]/10 text-[#368F8A] shrink-0 mt-0.5">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#191919]">Engine 1: LightGBM Early Warning Predictor</h4>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Processes historical load profiles, ambient temperatures, solar forecast models, and live momentum to deliver 15-minute lead times with &gt;90% precision.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-2 rounded-lg bg-[#7F9565]/10 text-[#7F9565] shrink-0 mt-0.5">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#191919]">Engine 2: 0/1 Knapsack Demand Response Optimizer</h4>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Models load reduction as an optimal bounded knapsack problem: min cost subject to capacity constraints, ensuring DISCOM spends the minimal coins necessary.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Card variant="dark" className="p-6">
                <div className="text-xs font-mono text-emerald-400 mb-3">
                  // Dual Engine Mathematical Formulation
                </div>
                <div className="bg-[#1E252C] rounded-lg p-4 font-mono text-xs text-gray-300 space-y-2 border border-[#2D3640]">
                  <p className="text-[#368F8A]"># Engine 1: Forecast Target Load</p>
                  <p className="text-gray-400">L_hat(t+15) = LightGBM(L_t, T_oil, T_amb, PV_t, EV_active)</p>
                  <p className="text-[#E56F59] mt-3"># Overload Requirement Calculation</p>
                  <p className="text-gray-400">Target_Reduction = max(0, L_hat(t+15) - 0.85 * Rated_kVA)</p>
                  <p className="text-[#7F9565] mt-3"># Engine 2: 0/1 Knapsack Solver</p>
                  <p className="text-gray-400">Minimize: Sum(x_i * Reward_Cost_i)</p>
                  <p className="text-gray-400">Subject to: Sum(x_i * Flexible_kW_i) &gt;= Target_Reduction</p>
                  <p className="text-gray-400">x_i in {'{0, 1}'} for all enrolled appliances</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Financial ROI Section */}
      <section id="impact" className="py-20 bg-[#F5F2E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" className="mb-3">
              PROVEN VALUE PROPOSITION
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191919] tracking-tight">
              Economic Impact & Asset Longevity
            </h2>
            <p className="mt-4 text-base text-[#6B7280]">
              Preventing even two transformer burnouts annually funds the entire flexibility reward ecosystem for an entire urban sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white text-center">
              <p className="text-3xl font-extrabold text-[#7F9565]">₹4,00,000</p>
              <p className="text-xs font-semibold text-[#191919] mt-2">Avg. Replacement Cost Saved</p>
              <p className="text-[11px] text-[#6B7280] mt-1">Per prevented 100/250 kVA failure</p>
            </Card>

            <Card className="p-6 bg-white text-center">
              <p className="text-3xl font-extrabold text-[#368F8A]">3.2 Years</p>
              <p className="text-xs font-semibold text-[#191919] mt-2">Asset Life Extension</p>
              <p className="text-[11px] text-[#6B7280] mt-1">By preventing oil overheating above 95°C</p>
            </Card>

            <Card className="p-6 bg-white text-center">
              <p className="text-3xl font-extrabold text-[#E56F59]">&lt; 60 Sec</p>
              <p className="text-xs font-semibold text-[#191919] mt-2">End-to-End Response Time</p>
              <p className="text-[11px] text-[#6B7280] mt-1">From alert to verified load reduction</p>
            </Card>

            <Card className="p-6 bg-white text-center">
              <p className="text-3xl font-extrabold text-[#24845B]">380%</p>
              <p className="text-xs font-semibold text-[#191919] mt-2">3-Year Projected ROI</p>
              <p className="text-[11px] text-[#6B7280] mt-1">Based on CEA transformer failure benchmarks</p>
            </Card>
          </div>

          <div className="mt-6 text-center text-xs text-[#6B7280] italic">
            * All figures are project-reported estimates calibrated against Indian CEA & Discom operational cost data.
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 bg-white border-y border-[#E3DED2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3">
              SYSTEM ARCHITECTURE
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191919] tracking-tight">
              Modular, Scalable Full-Stack Design
            </h2>
            <p className="mt-4 text-base text-[#6B7280]">
              Built with industry-grade open protocols and microservice readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl border border-[#E3DED2] bg-[#F5F2E9]/40 text-center">
              <Radio className="w-8 h-8 text-[#7F9565] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#191919]">Edge & Telemetry</h4>
              <p className="text-xs text-[#6B7280] mt-1">MQTT / Modbus IoT gateways reading current, voltage & temperature</p>
            </div>
            <div className="p-6 rounded-xl border border-[#E3DED2] bg-[#F5F2E9]/40 text-center">
              <Server className="w-8 h-8 text-[#368F8A] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#191919]">Backend Core</h4>
              <p className="text-xs text-[#6B7280] mt-1">Node.js Express / WebSocket engine with sub-second event bus</p>
            </div>
            <div className="p-6 rounded-xl border border-[#E3DED2] bg-[#F5F2E9]/40 text-center">
              <Cpu className="w-8 h-8 text-[#E56F59] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#191919]">Dual-Engine AI</h4>
              <p className="text-xs text-[#6B7280] mt-1">LightGBM predictive models + DP Knapsack optimizer</p>
            </div>
            <div className="p-6 rounded-xl border border-[#E3DED2] bg-[#F5F2E9]/40 text-center">
              <Layers className="w-8 h-8 text-[#24845B] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[#191919]">Operator & PWA</h4>
              <p className="text-xs text-[#6B7280] mt-1">Control room operator console & mobile-first consumer rewards PWA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#171D22] text-white py-12 border-t border-[#2D3640]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#2D3640]">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E252C] text-[#7F9565]">
                <Zap className="h-5 w-5 fill-[#368F8A] text-[#7F9565]" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-[#7F9565]">Urja</span>
                <span className="text-[#368F8A]">-Sync</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-gray-400">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Operator Dashboard
              </Link>
              <Link to="/simulation" className="hover:text-white transition-colors">
                Simulation Lab
              </Link>
              <Link to="/map" className="hover:text-white transition-colors">
                Grid Map
              </Link>
              <Link to="/demo" className="hover:text-white transition-colors">
                Guided Demo
              </Link>
              <Link to="/financial" className="hover:text-white transition-colors">
                ROI Calculator
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 Urja-Sync Platform. Prototype demonstration — synthetic data only.</p>
            <p>Designed for Smart Distribution Utilities & Electricity Departments (GED).</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
