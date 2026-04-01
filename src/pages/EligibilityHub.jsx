import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Slider,
    Divider,
    Card,
    CardContent,
    Alert,
    MenuItem,
    Stack,
    IconButton,
    LinearProgress,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControlLabel,
    Switch,
    Tooltip,
    Checkbox,
    FormGroup
} from '@mui/material';
import { 
    Calculator, 
    ShieldCheck, 
    AlertTriangle, 
    Download, 
    Zap, 
    PlusCircle, 
    CheckCircle2, 
    Info,
    TrendingUp,
    PieChart as PieIcon,
    ArrowRight,
    Users,
    CreditCard,
    Building2,
    Briefcase,
    Lightbulb,
    Target,
    BarChart3,
    GraduationCap,
    Clock,
    Globe,
    FileText,
    Percent,
    HardHat,
    BadgeAlert,
    Stethoscope,
    Scale
} from 'lucide-react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis
} from 'recharts';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants & Thresholds ---
const LOAN_PRODUCTS = {
    HOME: { 
        label: 'Home Loan', foirLimit: 50, baseRoi: 8.5, maxTenure: 360, color: '#3B82F6', ltvLimit: 90,
        multipliers: { Salaried: 60, SEP: 48, SENP: 42 }, pf: 0.5
    },
    PERSONAL: { 
        label: 'Personal Loan', foirLimit: 60, baseRoi: 10.5, maxTenure: 60, color: '#8B5CF6', ltvLimit: 100,
        multipliers: { Salaried: 18, SEP: 12, SENP: 10 }, pf: 1.5
    },
    BUSINESS: { 
        label: 'Business Loan', foirLimit: 65, baseRoi: 14.0, maxTenure: 48, color: '#F59E0B', ltvLimit: 85,
        multipliers: { Salaried: 0, SEP: 24, SENP: 30 }, pf: 2.0
    },
    EDUCATION: { 
        label: 'Education Loan', foirLimit: 55, baseRoi: 11.0, maxTenure: 180, color: '#10B981', ltvLimit: 100,
        multipliers: { Salaried: 48, SEP: 36, SENP: 36 }, pf: 1.0
    }
};

const OCCUPATIONS = [
    { label: 'IT / MNC Professional', risk: 0, icon: <Briefcase size={16} />, multiplier: 1.0 },
    { label: 'Doctor / Medical', risk: -5, icon: <Stethoscope size={16} />, multiplier: 1.1 },
    { label: 'Government Employee', risk: -10, icon: <Building2 size={16} />, multiplier: 1.2 },
    { label: 'Lawyer / Legal', risk: 15, icon: <Scale size={16} />, multiplier: 0.8 },
    { label: 'Police / Defense', risk: 10, icon: <BadgeAlert size={16} />, multiplier: 0.9 },
    { label: 'Builder / Developer', risk: 20, icon: <HardHat size={16} />, multiplier: 0.7 }
];

const LENDER_POLICIES = [
    { name: 'HDFC Credila', type: 'Specialized', baseRoi: 9.95, foirBonus: 5, products: ['EDUCATION'], pf: '1.0%', charges: 'Nil Prepayment', strengths: 'Domestic/Overseas' },
    { name: 'Avanse Financial', type: 'Leading NBFC', baseRoi: 10.25, foirBonus: 8, products: ['EDUCATION', 'PERSONAL'], pf: '1.5%', charges: 'Flexible Collateral', strengths: 'Fast Login' },
    { name: 'Auxilo', type: 'Fintech Lender', baseRoi: 11.0, foirBonus: 10, products: ['EDUCATION'], pf: '1.0% + GST', charges: 'No Prepayment Fee', strengths: '100% Unsecured' },
    { name: 'InCred', type: 'Flexible NBFC', baseRoi: 10.75, foirBonus: 10, products: ['EDUCATION', 'PERSONAL', 'BUSINESS'], pf: '2.0%', charges: 'Aggressive Multiplier', strengths: 'Low CIBIL Support' },
    { name: 'Tata Capital', type: 'Institutional', baseRoi: 9.5, foirBonus: 2, products: ['HOME', 'PERSONAL', 'BUSINESS', 'EDUCATION'], pf: '0.5% - 2%', charges: 'Processing in 48h', strengths: 'Highest Trust' },
    { name: 'Prodigy Finance', type: 'International', baseRoi: 13.0, foirBonus: 15, products: ['EDUCATION'], pf: '2.5% Admin Fee', charges: 'No Cosigner Req', strengths: 'Global Univs' },
    { name: 'Axis Bank', type: 'Private Bank', baseRoi: 11.5, foirBonus: 0, products: ['HOME', 'PERSONAL', 'BUSINESS', 'EDUCATION'], pf: '1.0%', charges: 'Standard Fees', strengths: 'Direct Bank' },
    { name: 'ICICI Bank', type: 'Global Banking', baseRoi: 9.75, foirBonus: 0, products: ['HOME', 'PERSONAL', 'BUSINESS', 'EDUCATION'], pf: '0.5%', charges: 'Digital Sanction', strengths: 'Top Speed' },
    { name: 'Poonawalla Fincorp', type: 'NBFC', baseRoi: 10.25, foirBonus: 5, products: ['PERSONAL', 'BUSINESS', 'EDUCATION'], pf: '1.5%', charges: 'Paperless Process', strengths: 'Easy Documentation' }
];

const EligibilityHub = () => {
    const theme = useTheme();
    const [product, setProduct] = useState('EDUCATION');
    const [employment, setEmployment] = useState('Salaried');
    const [occupation, setOccupation] = useState(OCCUPATIONS[0]);
    const [income, setIncome] = useState(75000);
    const [cibil, setCibil] = useState(750);
    const [hasCoApplicant, setHasCoApplicant] = useState(false);
    const [coIncome, setCoIncome] = useState(0);
    const [emi, setEmi] = useState(15000);
    const [loanAmount, setLoanAmount] = useState(2500000);
    const [tenure, setTenure] = useState(120); 
    const [roi, setRoi] = useState(11.0);
    const [propertyValue, setPropertyValue] = useState(4000000);

    // --- Document States ---
    const [docs, setDocs] = useState({
        bankStmt: true,
        itr: false,
        salSlip: true,
        kyc: true
    });

    // --- Core Dynamic Logic ---
    const metrics = useMemo(() => {
        const p = LOAN_PRODUCTS[product];
        const r = roi / 1200;
        const n = tenure;
        const totalIncome = income + (hasCoApplicant ? coIncome : 0);
        
        // Multiplier Adjustment
        const baseMultiplier = p.multipliers[employment] || 0;
        const occMultiplier = occupation.multiplier;
        const multiplierEligible = totalIncome * baseMultiplier * occMultiplier;

        // EMI & Costs
        const monthlyEmi = loanAmount > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
        const totalPayment = monthlyEmi * n;
        const totalInterest = totalPayment - loanAmount;
        
        const pfAmount = (loanAmount * p.pf) / 100;
        const gstOnPf = pfAmount * 0.18;
        const insuranceEst = (loanAmount * 0.02); // 2% Insurance estimate
        const upfrontCost = pfAmount + gstOnPf + insuranceEst;

        // CIBIL & Occupation adjusted FOIR
        let adjustedFoir = p.foirLimit;
        if (cibil >= 800) adjustedFoir += 10;
        else if (cibil >= 750) adjustedFoir += 5;
        else if (cibil < 650) adjustedFoir -= 15;
        adjustedFoir -= occupation.risk; // Increase risk reduces FOIR

        const currentFoir = (emi / totalIncome) * 100;
        const postLoanFoir = ((emi + monthlyEmi) / totalIncome) * 100;
        const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

        const disposableIncome = totalIncome * (adjustedFoir / 100);
        const maxAllowedEmi = Math.max(0, disposableIncome - emi);
        const maxEligibleLoan = r > 0 ? (maxAllowedEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : 0;

        // Probability Score (Refined)
        let prob = 90; 
        if (postLoanFoir > adjustedFoir) prob -= 45;
        if (cibil < 700) prob -= 35;
        if (ltv > p.ltvLimit) prob -= 25;
        if (!docs.itr && employment !== 'Salaried') prob -= 20;
        if (occupation.risk > 10) prob -= 15;
        const probability = Math.max(0, Math.min(100, prob));

        return {
            monthlyEmi, totalInterest, totalPayment, currentFoir, postLoanFoir,
            ltv, maxEligibleLoan, multiplierEligible, adjustedFoir, probability,
            isFoirSafe: postLoanFoir <= adjustedFoir,
            isLtvSafe: ltv <= p.ltvLimit,
            totalIncome, upfrontCost, pfAmount, gstOnPf, insuranceEst
        };
    }, [product, employment, occupation, income, cibil, hasCoApplicant, coIncome, emi, loanAmount, tenure, roi, propertyValue, docs]);

    const bankComparison = LENDER_POLICIES
        .filter(bank => bank.products.includes(product))
        .map(bank => {
            const adjustedRoi = bank.baseRoi;
            const bankFoir = metrics.adjustedFoir + bank.foirBonus;
            const r = adjustedRoi / 1200;
            const n = tenure;
            const disposableIncome = metrics.totalIncome * (bankFoir / 100);
            const maxAllowedEmi = Math.max(0, disposableIncome - emi);
            const maxEligible = r > 0 ? (maxAllowedEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : 0;
            return { ...bank, maxEligible, adjustedRoi };
        }).sort((a,b) => b.maxEligible - a.maxEligible);

    return (
        <Box sx={{ maxWidth: '1800px', mx: 'auto', p: { xs: 1, md: 4 } }}>
            {/* --- GOD-LEVEL GLOBAL HEADER --- */}
            <Box sx={{ mb: 6, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 3 }}>
                <Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -4, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        Veda Core 360° Intelligence <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}><ShieldCheck size={24} /></Avatar>
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, opacity: 0.8 }}>
                        Absolute Genuine Screening • Banking Multi-Policies • Cost Analytics
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" startIcon={<Download size={20} />} sx={{ borderRadius: 4, fontWeight: 800 }}>Strategy Deck</Button>
                    <Button variant="contained" startIcon={<PlusCircle size={20} />} sx={{ borderRadius: 4, fontWeight: 900, px: 4, py: 1.8, bgcolor: 'primary.main', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                        Push to Registry
                    </Button>
                </Stack>
            </Box>

            <Grid container spacing={4}>
                {/* --- 1. PROFILE ENGINE (LEFT) --- */}
                <Grid size={{ xs: 12, lg: 3.5 }}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
                                <Users /> KYC & Profile Meta
                            </Typography>
                            
                            <Stack spacing={3}>
                                <TextField
                                    select fullWidth label="Product Line" value={product} variant="outlined"
                                    onChange={(e) => { setProduct(e.target.value); setRoi(LOAN_PRODUCTS[e.target.value].baseRoi); }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, fontWeight: 700 } }}
                                >
                                    {Object.entries(LOAN_PRODUCTS).map(([key, item]) => <MenuItem key={key} value={key}>{item.label}</MenuItem>)}
                                </TextField>

                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.6, mb: 1.5, display: 'block' }}>Occupation Risk Factor</Typography>
                                    <TextField
                                        select fullWidth value={occupation.label} variant="outlined"
                                        onChange={(e) => setOccupation(OCCUPATIONS.find(o => o.label === e.target.value))}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, fontWeight: 700 } }}
                                    >
                                        {OCCUPATIONS.map((o) => (
                                            <MenuItem key={o.label} value={o.label}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{o.icon} {o.label}</Box>
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                    {['Salaried', 'SEP', 'SENP'].map((t) => (
                                        <Button key={t} fullWidth variant={employment === t ? "contained" : "outlined"} onClick={() => setEmployment(t)} sx={{ borderRadius: 4, textTransform: 'none', fontWeight: 800 }}>{t}</Button>
                                    ))}
                                </Stack>

                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.6, display: 'block', mb: 1 }}>CIBIL Score: {cibil}</Typography>
                                    <Slider value={cibil} min={300} max={900} onChange={(_, v) => setCibil(v)} color={cibil > 700 ? "success" : "error"} />
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.8, display: 'block', mb: 2 }}>Document Readiness Checklist</Typography>
                                    <FormGroup>
                                        <FormControlLabel control={<Checkbox checked={docs.salSlip} onChange={() => setDocs({...docs, salSlip: !docs.salSlip})} size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Salary Slips (3M)</Typography>} />
                                        <FormControlLabel control={<Checkbox checked={docs.bankStmt} onChange={() => setDocs({...docs, bankStmt: !docs.bankStmt})} size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Bank Stmt (6M)</Typography>} />
                                        <FormControlLabel control={<Checkbox checked={docs.itr} onChange={() => setDocs({...docs, itr: !docs.itr})} size="small" />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>ITR / GST Filing</Typography>} />
                                    </FormGroup>
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>Income Dynamics</Typography>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.6, display: 'block', mb: 1 }}>Monthly Income: ₹{income.toLocaleString()}</Typography>
                                    <Slider value={income} min={15000} max={500000} step={5000} onChange={(_, v) => setIncome(v)} />
                                </Box>
                                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 4, border: '1px dashed', borderColor: 'primary.main' }}>
                                    <FormControlLabel control={<Switch checked={hasCoApplicant} onChange={(e) => setHasCoApplicant(e.target.checked)} />} label={<Typography variant="body2" sx={{ fontWeight: 900 }}>Joint Applicant</Typography>} />
                                    {hasCoApplicant && <Slider value={coIncome} min={0} max={300000} step={5000} onChange={(_, v) => setCoIncome(v)} sx={{ mt: 1 }} />}
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>

                {/* --- 2. ANALYTICS SUITE (CENTER) --- */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 4, borderRadius: 6, bgcolor: '#0f172a', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.light', mb: 1, letterSpacing: 2 }}>VEDA GENUINE PROBABILITY</Typography>
                                    <Typography variant="h1" sx={{ fontWeight: 900 }}>{metrics.probability}%</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Chip label={metrics.probability > 70 ? "HIGH PASS" : "REVIEW REQ"} color={metrics.probability > 70 ? "success" : "error"} sx={{ fontWeight: 900, fontSize: '0.7rem' }} />
                                    <Typography variant="h4" sx={{ mt: 1, opacity: 0.5 }}>{Math.round(metrics.probability * 7.5)}</Typography>
                                </Box>
                            </Box>
                            <LinearProgress variant="determinate" value={metrics.probability} sx={{ height: 16, borderRadius: 8, bgcolor: alpha('#fff', 0.1), '& .MuiLinearProgress-bar': { bgcolor: metrics.probability > 70 ? '#10b981' : '#f43f5e' } }} />
                            <Grid container spacing={2} sx={{ mt: 4 }}>
                                <Grid size={4}><Typography variant="caption" sx={{ opacity: 0.6 }}>FOIR Factor</Typography><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{metrics.isFoirSafe ? 'SAFE' : 'RISK'}</Typography></Grid>
                                <Grid size={4}><Typography variant="caption" sx={{ opacity: 0.6 }}>CIBIL Impact</Typography><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{cibil > 700 ? 'GOOD' : 'WEAK'}</Typography></Grid>
                                <Grid size={4}><Typography variant="caption" sx={{ opacity: 0.6 }}>Occ Risk</Typography><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{occupation.risk}%</Typography></Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}><Building2 /> Live Bank Market Analysis</Typography>
                            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 900 }}>Credit Partner</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }} align="right">Max Support</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }} align="right">PF (%)</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }} align="right">Strength</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bankComparison.map((bank) => (
                                            <TableRow key={bank.name} hover>
                                                <TableCell><Typography sx={{ fontWeight: 800 }}>{bank.name}</Typography></TableCell>
                                                <TableCell align="right"><Typography sx={{ fontWeight: 900, color: 'primary.main' }}>₹{(bank.maxEligible / 100000).toFixed(2)}L</Typography></TableCell>
                                                <TableCell align="right"><Typography sx={{ fontWeight: 700 }}>{bank.pf}</Typography></TableCell>
                                                <TableCell align="right"><Chip label={bank.charges} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.6rem' }} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.success.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1) }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}><TrendingUp color={theme.palette.success.main} /> Opportunity Strategy</Typography>
                            <Grid container spacing={3}>
                                <Grid size={6}><Box><Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6 }}>MAX (FOIR BASED)</Typography><Typography variant="h5" sx={{ fontWeight: 900 }}>₹{(metrics.maxEligibleLoan / 100000).toFixed(2)}L</Typography></Box></Grid>
                                <Grid size={6}><Box><Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6 }}>PRO-MULTIPLIER</Typography><Typography variant="h5" sx={{ fontWeight: 900 }}>₹{(metrics.multiplierEligible / 100000).toFixed(2)}L</Typography></Box></Grid>
                            </Grid>
                            <Button variant="text" fullWidth sx={{ mt: 2, borderRadius: 3, textTransform: 'none', fontWeight: 800 }}>View Optimized Amortization Plan →</Button>
                        </Paper>
                    </Stack>
                </Grid>

                {/* --- 3. COST & ADVICE (RIGHT) --- */}
                <Grid size={{ xs: 12, lg: 3 }}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}><Percent color="primary" /> Loan Cost Center</Typography>
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Proc. Fees (PF)</Typography><Typography variant="body2" sx={{ fontWeight: 900 }}>₹{Math.round(metrics.pfAmount).toLocaleString()}</Typography></Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>GST (18% on PF)</Typography><Typography variant="body2" sx={{ fontWeight: 900 }}>₹{Math.round(metrics.gstOnPf).toLocaleString()}</Typography></Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Insurance (Est.)</Typography><Typography variant="body2" sx={{ fontWeight: 900 }}>₹{Math.round(metrics.insuranceEst).toLocaleString()}</Typography></Box>
                                <Divider />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Total Upfront</Typography><Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'error.main' }}>₹{Math.round(metrics.upfrontCost).toLocaleString()}</Typography></Box>
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.info.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.2) }}>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}><Lightbulb color={theme.palette.info.main} /> Genuine Strategy</Typography>
                            <Stack spacing={2.5}>
                                {getGenuineAdvice(metrics, hasCoApplicant, product, docs, occupation).map((adv, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 1.5 }}><CheckCircle2 size={18} color={theme.palette.success.main} style={{ marginTop: 2, flexShrink: 0 }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{adv}</Typography></Box>
                                ))}
                            </Stack>
                        </Paper>

                        <Card sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2 }}>Loan Burden Ratio</Typography>
                            <Box sx={{ height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[{ name: 'EMI share', value: metrics.monthlyEmi }, { name: 'Disposable', value: (metrics.totalIncome - emi - metrics.monthlyEmi) }]} innerRadius={50} outerRadius={65} dataKey="value">
                                            <Cell fill={theme.palette.primary.main} /><Cell fill="#f1f5f9" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 900 }}>₹{Math.round(metrics.monthlyEmi).toLocaleString()} / mo</Typography>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

// --- Genuine Logic Helpers ---
const getGenuineAdvice = (m, hasCo, prod, docs, occ) => {
    const advice = [];
    if (!m.isFoirSafe) {
        if (!hasCo) advice.push("Critical: Joint applicant required to bridge income gap.");
        advice.push("Stretch tenure to max to normalize Debt-to-Income.");
    }
    if (occ.risk > 10) advice.push("NBFCs preferred; Private banks have strict negative profile listing for this sector.");
    if (!docs.itr) advice.push("Missing ITR: Target InCred or Avanse for non-conforming income profiles.");
    if (m.probability > 80) advice.push("Pre-Approved Profile: High leverage for PF waiver negotiation.");
    return advice;
};

export default EligibilityHub;
