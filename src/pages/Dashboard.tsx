import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui-custom/KpiCard';
import { AlertCard } from '@/components/ui-custom/AlertCard';
import { StatusChip } from '@/components/ui-custom/StatusChip';
import { Skeleton } from '@/components/ui/skeleton';

const alertData = [
  {
    title: 'Financeiro',
    message: '5 pagamentos em atraso (R$ 12.500)',
    severity: 'high' as const,
  },
  {
    title: 'Operacional', 
    message: '3 contratos aguardando aprovação',
    severity: 'medium' as const,
  },
  {
    title: 'Dados',
    message: 'Backup realizado com sucesso há 2 horas',
    severity: 'low' as const,
  },
];

const kpiData = [
  { title: 'Total em atraso', value: 'R$ 12.500', icon: DollarSign },
  { title: 'Pagamentos atrasados', value: '5', icon: CreditCard },
  { title: 'Vencem em 7 dias', value: 'R$ 8.300', icon: Calendar },
  { title: 'Vencem em 30 dias', value: 'R$ 24.700', icon: Clock },
  { title: 'Entradas pendentes', value: 'R$ 45.200', icon: TrendingUp },
];

const nextSteps = [
  {
    title: 'Aprovar contrato Tech Solutions',
    client: 'Tech Solutions Corp',
    status: 'pending' as const,
  },
  {
    title: 'Enviar proposta Digital Innovators',
    client: 'Digital Innovators Ltd', 
    status: 'operational' as const,
  },
  {
    title: 'Revisar documentos Future Systems',
    client: 'Future Systems Inc',
    status: 'financial' as const,
  },
];

const recentContracts = [
  {
    client: 'Tech Solutions Corp',
    product: 'Consultoria Premium 12m',
    entryValue: 'R$ 15.000',
    status: 'active' as const,
  },
  {
    client: 'Digital Innovators Ltd',
    product: 'Mentoria Intensiva 6m', 
    entryValue: 'R$ 8.500',
    status: 'pending' as const,
  },
];

const weeklyAgenda = [
  {
    day: 'Segunda',
    date: '23/09',
    events: [
      { time: '09:00', title: 'Reunião Tech Solutions', client: 'Tech Solutions' },
      { time: '14:00', title: 'Apresentação proposta', client: 'Digital Innovators' },
    ],
  },
  {
    day: 'Terça', 
    date: '24/09',
    events: [
      { time: '10:30', title: 'Follow-up contrato', client: 'Future Systems' },
    ],
  },
];

const recentActivity = [
  { time: '2h atrás', action: 'Contrato assinado', details: 'Tech Solutions Corp' },
  { time: '4h atrás', action: 'Pagamento recebido', details: 'R$ 5.000 - Digital Innovators' },
  { time: '1d atrás', action: 'Novo cliente cadastrado', details: 'Smart Business Co' },
];

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [isLoading] = React.useState(false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-fg-1">Dashboard</h1>
        <p className="text-fg-3 mt-1">Visão geral das suas operações</p>
      </div>

      {/* Alerts Section */}
      <section>
        <h2 className="text-lg font-semibold text-fg-1 mb-4">Alertas do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alertData.map((alert, index) => (
            <motion.div
              key={alert.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.1,
                ease: [0.2, 0, 0, 1] 
              }}
            >
              <AlertCard {...alert} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* KPI Section */}
      <section>
        <h2 className="text-lg font-semibold text-fg-1 mb-4">Situação Financeira</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2, 
                delay: index * 0.1,
                ease: [0.2, 0, 0, 1] 
              }}
            >
              <KpiCard {...kpi} />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Steps */}
        <section>
          <h2 className="text-lg font-semibold text-fg-1 mb-4">Próximos Passos</h2>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.1,
                  ease: [0.2, 0, 0, 1] 
                }}
              >
                <Card className="shadow-card-md hover:shadow-card-lg transition-shadow duration-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-fg-1">{step.title}</h3>
                        <p className="text-sm text-fg-3">{step.client}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusChip status={step.status}>
                          {step.status === 'pending' ? 'Pendente' : 
                           step.status === 'operational' ? 'Em andamento' : 'Urgente'}
                        </StatusChip>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Contracts */}
        <section>
          <h2 className="text-lg font-semibold text-fg-1 mb-4">Contratos Recentes</h2>
          <div className="space-y-3">
            {recentContracts.map((contract, index) => (
              <motion.div
                key={contract.client}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.1,
                  ease: [0.2, 0, 0, 1] 
                }}
              >
                <Card className="shadow-card-md hover:shadow-card-lg transition-shadow duration-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium text-fg-1">{contract.client}</h3>
                        <p className="text-sm text-fg-3">{contract.product}</p>
                        <p className="text-sm font-semibold text-primary">{contract.entryValue}</p>
                      </div>
                      <StatusChip status={contract.status}>
                        {contract.status === 'active' ? 'Ativo' : 'Pendente'}
                      </StatusChip>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Agenda */}
        <section>
          <h2 className="text-lg font-semibold text-fg-1 mb-4">Agenda Semanal</h2>
          <Card className="shadow-card-md">
            <CardContent className="p-4">
              <div className="space-y-4">
                {weeklyAgenda.map((day) => (
                  <div key={day.day}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-fg-1">{day.day}</span>
                      <span className="text-sm text-fg-3">{day.date}</span>
                    </div>
                    <div className="space-y-2 ml-4">
                      {day.events.map((event, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-surface-1 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-fg-1">{event.time}</span>
                            <span className="text-sm text-fg-2 ml-2">{event.title}</span>
                          </div>
                          <span className="text-xs text-fg-3">{event.client}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-semibold text-fg-1 mb-4">Atividade Recente</h2>
          <Card className="shadow-card-md">
            <CardContent className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-fg-1">{activity.action}</span>
                        <span className="text-xs text-fg-3">{activity.time}</span>
                      </div>
                      <p className="text-sm text-fg-3 mt-1">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}