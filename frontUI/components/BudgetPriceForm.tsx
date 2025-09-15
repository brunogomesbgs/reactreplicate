"use client";

import {Button, buttonVariants} from "@/components/ui/button";
import {Sparkles, UserIcon} from "lucide-react";
import {Dispatch, SetStateAction, useState, useEffect, useRef} from "react";
import {toast} from "sonner";
import OrcamentoItemSidebar, {OrcamentoItem} from "./OrcamentoItemSidebar";
import {useClients} from "@/lib/hooks/useClients";
import ClientsModal from "./ClientsModal";
import type {Client} from "@/app/(dashboard)/dashboard/orcamentos/types";
import {useRouter} from "next/navigation";
import LimifyPuppet from "@/public/limify_completeform_puppet.png";
import LimifyAdditionalPuppet from "@/public/limify_additional_puppet.png";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {useBudgets} from "@/lib/hooks/useBudgets";

interface BudgetPriceFormProps {
    budgetStep: number;
    setBudgetStep: React.Dispatch<React.SetStateAction<number>>;
    selectedBudgetType: string | null;
    finishBudget: () => void;
}

// Interface para itens do orçamento por preço de obra
interface BudgetPriceItem {
    id: string;
    name: string;
    description: string;
    baseValue: number;
    complexityPercentage: number;
    deliveryTimePercentage: number;
    deliveryTimeDays: number;
    total: number;
    exibir: boolean;
    isEditingField?:
        | "baseValue"
        | "complexityPercentage"
        | "deliveryTimePercentage"
        | "deliveryTimeDays"
        | null;
}

export default function BudgetPriceForm({
                                            budgetStep,
                                            setBudgetStep,
                                            selectedBudgetType,
                                            finishBudget,
                                        }: BudgetPriceFormProps) {
    const [clientName, setClientName] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");

    // Estados para o orçamento por preço de obra
    const [baseValue, setBaseValue] = useState<number>(0);
    const [complexityPercentage, setComplexityPercentage] = useState<number>(0);
    const [deliveryTimePercentage, setDeliveryTimePercentage] =
        useState<number>(0);
    const [deliveryTimeDays, setDeliveryTimeDays] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    // Estados para perguntas adicionais
    const [tipoObra, setTipoObra] = useState<
        "residencial" | "comercial" | "industrial" | null
    >(null);
    const [tipoServico, setTipoServico] = useState<
        "projeto" | "execucao" | "ambos" | null
    >(null);

    // Estados para moeda e região
    const [selectedCurrency, setSelectedCurrency] = useState<"BRL" | "USD">(
        "BRL"
    );
    const [selectedState, setSelectedState] = useState<string>("");
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [stateSearch, setStateSearch] = useState("");
    const [workArea, setWorkArea] = useState<number>(0);

    // Estados para a etapa 3 - Padrões de obra
    const [workModel, setWorkModel] = useState<
        "comercial" | "residencial" | "especiais" | null
    >(null);
    const [workStandard, setWorkStandard] = useState<
        "baixo" | "medio" | "alto" | null
    >(null);
    const [projectStandard, setProjectStandard] = useState<
        "r1" | "pp4" | "r8" | "r16" | "pis" | "cal8" | "csl8" | "csl16" | "rp1q" | "gi" | "personalizado" | null
    >(null);
    const [customValue, setCustomValue] = useState<number>(0);
    const [sindusconValues, setSindusconValues] = useState<any>(null);

    // Estados para projetos da etapa 4
    const [engineeringProjects, setEngineeringProjects] = useState({
        execucaoObra: false,
        estrutural: false,
        prevencaoIncendio: false,
        eletrico: false,
        hidrossanitario: false,
        fundacao: false,
        contencao: false,
        spda: false,
        outro: false,
    });

    const getCurrencySymbol = () => {
        return selectedCurrency === "USD" ? "$" : "R$";
    };

    const [architecturalProjects, setArchitecturalProjects] = useState({
        arquitetonico: false,
        interiores: false,
        render: false,
        iluminacao: false,
        outro: false,
    });

    const [customCategory, setCustomCategory] = useState("");
    const [customCategories, setCustomCategories] = useState<string[]>([]);

    // Estados para a tabela de valores dos projetos
    const [projectValues, setProjectValues] = useState<
        Array<{
            id: string;
            name: string;
            isInstallment: boolean;
            installmentCount: number;
            installmentValue: number;
            projectPercentage: number;
            budgetValue: number;
            isEditingField?:
                | "installmentCount"
                | "installmentValue"
                | "projectPercentage"
                | null;
        }>
    >([]);

    // Array com todos os estados do Brasil
    const brazilianStates = [
        {uf: "AC", name: "Acre"},
        {uf: "AL", name: "Alagoas"},
        {uf: "AP", name: "Amapá"},
        {uf: "AM", name: "Amazonas"},
        {uf: "BA", name: "Bahia"},
        {uf: "CE", name: "Ceará"},
        {uf: "DF", name: "Distrito Federal"},
        {uf: "ES", name: "Espírito Santo"},
        {uf: "GO", name: "Goiás"},
        {uf: "MA", name: "Maranhão"},
        {uf: "MT", name: "Mato Grosso"},
        {uf: "MS", name: "Mato Grosso do Sul"},
        {uf: "MG", name: "Minas Gerais"},
        {uf: "PA", name: "Pará"},
        {uf: "PB", name: "Paraíba"},
        {uf: "PR", name: "Paraná"},
        {uf: "PE", name: "Pernambuco"},
        {uf: "PI", name: "Piauí"},
        {uf: "RJ", name: "Rio de Janeiro"},
        {uf: "RN", name: "Rio Grande do Norte"},
        {uf: "RS", name: "Rio Grande do Sul"},
        {uf: "RO", name: "Rondônia"},
        {uf: "RR", name: "Roraima"},
        {uf: "SC", name: "Santa Catarina"},
        {uf: "SP", name: "São Paulo"},
        {uf: "SE", name: "Sergipe"},
        {uf: "TO", name: "Tocantins"},
    ];

    // Estados filtrados baseados na busca
    const filteredStates = brazilianStates.filter(
        (state) =>
            state.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
            state.uf.toLowerCase().includes(stateSearch.toLowerCase())
    );

    // Função para buscar valores do Sinduscon
    const fetchSindusconValues = async (estado: string) => {
        try {
            const response = await fetch(`/api/admin/sinduscon?estado=${estado}`);
            if (response.ok) {
                const data = await response.json();
                setSindusconValues(data);
            }
        } catch (error) {
            console.error("Erro ao buscar valores do Sinduscon:", error);
            toast.error("Erro ao carregar valores de referência");
        }
    };

    // Função para calcular valores dos diferentes padrões
    const calculateStandardValues = () => {
        if (!sindusconValues || !workArea || !projectStandard) return null;

        let baseValue = 0;

        // Pegar o valor base do padrão selecionado
        switch (projectStandard) {
            case "r1":
                baseValue = sindusconValues.r1 || 0;
                break;
            case "pp4":
                baseValue = sindusconValues.pp4 || 0;
                break;
            case "r8":
                baseValue = sindusconValues.r8 || 0;
                break;
            case "r16":
                baseValue = sindusconValues.r16 || 0;
                break;
            case "pis":
                baseValue = sindusconValues.pis || 0;
                break;
            case "cal8":
                baseValue = sindusconValues.cal8 || 0;
                break;
            case "csl8":
                baseValue = sindusconValues.csl8 || 0;
                break;
            case "csl16":
                baseValue = sindusconValues.csl16 || 0;
                break;
            case "rp1q":
                baseValue = sindusconValues.rp1q || 0;
                break;
            case "gi":
                baseValue = sindusconValues.gi || 0;
                break;
            default:
                baseValue = customValue || 0;
                break;
        }

        // Calcular valores para cada padrão baseado no padrão selecionado
        const padraoBaixo = baseValue * 0.625; // 62.5% do valor base
        const padraoMedio = baseValue; // 100% do valor base
        const padraoAlto = baseValue * 2; // 200% do valor base

        // Calcular valores totais considerando a metragem
        const totalPadraoBaixo = padraoBaixo * workArea;
        const totalPadraoMedio = padraoMedio * workArea;
        const totalPadraoAlto = padraoAlto * workArea;

        return [
            {
                name: "Padrão baixo",
                value: totalPadraoBaixo,
                formattedValue: `${getCurrencySymbol()} ${(totalPadraoBaixo / 1000).toFixed(0)} mil`,
                isSelected: workStandard === "baixo",
            },
            {
                name: "Padrão médio",
                value: totalPadraoMedio,
                formattedValue: `${getCurrencySymbol()} ${(totalPadraoMedio / 1000).toFixed(0)} mil`,
                isSelected: workStandard === "medio",
            },
            {
                name: "Padrão alto",
                value: totalPadraoAlto,
                formattedValue: `${getCurrencySymbol()} ${(totalPadraoAlto / 1000).toFixed(0)} mil`,
                isSelected: workStandard === "alto",
            },
        ];
    };

    // Função para verificar se um padrão pode ser selecionado
    const canSelectProjectStandard = (standard: string) => {
        // "Personalizado" é sempre uma opção válida, independente do modelo ou padrão.
        if (standard === "personalizado") return true;

        // Lógica para o modelo "Residencial", baseada no padrão de obra.
        if (workModel === "residencial") {
            if (workStandard === "baixo") {
                // Padrões de projeto para residencial de padrão baixo.
                return ["r1", "pp4", "r8", "pis"].includes(standard);
            }
            if (workStandard === "medio") {
                // Padrões de projeto para residencial de padrão médio.
                return ["r1", "pp4", "r8", "r16"].includes(standard);
            }
            if (workStandard === "alto") {
                // Padrões de projeto para residencial de padrão alto.
                return ["r8", "r16"].includes(standard);
            }
        }

        // Lógica para o modelo "Comercial", baseada no padrão de obra.
        if (workModel === "comercial") {
            // Para o modelo "Comercial", os padrões de projeto "cal8", "csl8", e "csl16" estão sempre disponíveis.
            return ["cal8", "csl8", "csl16"].includes(standard);
        }

        // Lógica para o modelo "Especiais".
        if (workModel === "especiais") {
            // Para "Especiais", o padrão de obra é sempre "medio",
            // e os padrões de projeto são "GI" (Galpão Industrial) e "RP1Q" (Residencial Popular).
            return ["gi", "rp1q"].includes(standard);
        }

        // Se nenhum modelo ou padrão de obra for selecionado, permite a seleção para evitar travar a UI.
        if (!workModel || !workStandard) return true;

        // Se nenhuma das condições acima for atendida, o padrão de projeto não é selecionável.
        return false;
    };

    // Estados para ajuste de valor
    const [adicionalValor, setAdicionalValor] = useState<number>(0);
    const [desconto, setDesconto] = useState<number>(0);
    const [tipoDesconto, setTipoDesconto] = useState<"percentual" | "valor">(
        "percentual"
    );
    const [opcoesAjusteValor, setOpcoesAjusteValor] = useState<string[]>([]);

    // Estado para os itens do orçamento
    const [budgetItems, setBudgetItems] = useState<BudgetPriceItem[]>([]);

    // Estados para a sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BudgetPriceItem | null>(null);

    // Estados adicionais
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {clients, fetchClients, createClient} = useClients();
    const [clientId, setClientId] = useState<string | null>(null);
    const [showClientsModal, setShowClientsModal] = useState(false);
    const [clientSearch, setClientSearch] = useState("");
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const {fetchCountBudget, countBudget} = useBudgets();

    const router = useRouter();

    useEffect(() => {
        fetchCountBudget()
    }, []);

    // Função para alternar a exibição de um item
    const toggleItemVisibility = (itemId: string) => {
        setBudgetItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? {...item, exibir: !item.exibir} : item
            )
        );
    };

    // Função para adicionar serviço padrão
    const addDefaultService = (serviceType: string) => {
        const defaultServices = {
            projeto: {
                name: "Projeto Executivo",
                description: "Desenvolvimento completo do projeto executivo",
            },
            execucao: {
                name: "Execução da Obra",
                description: "Acompanhamento e execução da obra",
            },
            ambos: {
                name: "Projeto + Execução",
                description: "Projeto completo + execução da obra",
            },
            residencial: {
                name: "Projeto Residencial",
                description: "Projeto para construção residencial",
            },
            comercial: {
                name: "Projeto Comercial",
                description: "Projeto para construção comercial",
            },
        };

        const service =
            defaultServices[serviceType as keyof typeof defaultServices];
        if (service) {
            const newItem: BudgetPriceItem = {
                id: Date.now().toString(),
                name: service.name,
                description: service.description,
                baseValue: 0,
                complexityPercentage: 0,
                deliveryTimePercentage: 0,
                deliveryTimeDays: 0,
                total: 0,
                exibir: true,
                isEditingField: "baseValue",
            };
            setBudgetItems([...budgetItems, newItem]);
            toast.success(`${service.name} adicionado! Preencha os valores.`);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Limpar padrão do projeto quando padrão de obra mudar para incompatível
    useEffect(() => {
        if (
            workStandard &&
            projectStandard &&
            !canSelectProjectStandard(projectStandard)
        ) {
            setProjectStandard(null);
            setCustomValue(0);
        }
    }, [workStandard, projectStandard]);

    // Limpar padrão de obra quando modelo de obra mudar para incompatível
    useEffect(() => {
        if (workModel === "especiais") {
            setWorkStandard("medio");
        } else if (workModel === "comercial" && workStandard === "baixo") {
            setWorkStandard(null);
        }
    }, [workModel]);

    // Gerar projetos quando as seleções mudarem
    useEffect(() => {
        generateProjectValues();
    }, [
        engineeringProjects,
        architecturalProjects,
        customCategories,
        workArea,
        projectStandard,
        customValue,
    ]);

    useEffect(() => {
        if (clientSearch.length === 0) {
            setFilteredClients(clients);
        } else {
            setFilteredClients(
                clients.filter((c: { name: string; }) =>
                    c.name.toLowerCase().includes(clientSearch.toLowerCase())
                )
            );
        }
    }, [clientSearch, clients]);

    const handleSelectClient = (client: Client) => {
        setClientId(client.id);
        setClientName(client.name);
        setClientSearch(client.name);
        setShowClientsModal(false);
    };

    // Função para enviar orçamento para a API
    const handleSubmitBudget = async () => {
        setIsSubmitting(true);

        try {
            console.log("Iniciando geração de preview...");
            console.log("Dados atuais:", {
                projectName,
                clientName,
                workArea,
                workModel,
                workStandard,
                projectStandard,
                customValue,
                sindusconValues,
                projectValues,
            });

            // Calcular valor base com proteção contra erros
            const baseValue = calculateBaseValue() || 0;
            console.log("Valor base calculado:", baseValue);

            const adicional = opcoesAjusteValor.includes("adicional")
                ? adicionalValor || 0
                : 0;
            const descontoValue = opcoesAjusteValor.includes("desconto")
                ? desconto || 0
                : 0;

            let totalValue = baseValue + adicional;

            // Aplicar desconto se houver
            if (opcoesAjusteValor.includes("desconto") && descontoValue > 0) {
                if (tipoDesconto === "percentual") {
                    totalValue -= (baseValue * descontoValue) / 100;
                } else {
                    totalValue -= descontoValue;
                }
            }

            console.log("Valor total calculado:", totalValue);
            const payload = {
                projectName: projectName,
                description: projectDescription,
                client_id: clientId,
                clientName: clientName,
                workModel: workModel,
                totalValue: totalValue,
                currency: selectedCurrency,
                state: selectedState,
                workArea: workArea,
                workStandard: workStandard,
                projectStandard: projectStandard,
                customValue: customValue,
                engineeringProjects: engineeringProjects,
                architecturalProjects: architecturalProjects,
                customCategories: customCategories,
                items: projectValues.map((item) => ({
                    name: item.name,
                    projectPercentage: item.projectPercentage,
                    budgetValue: item.budgetValue,
                    currency: selectedCurrency
                })),
                prazosEmMeses: prazoEmMeses,
                desconto: desconto,
                tipoDesconto: tipoDesconto,
                baseValue: baseValue,
            };
            const res = await fetch("/api/budgets/price", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Preparar dados para o preview
                const previewData = {
                    budgetId: data.budgetId,
                    projectName: projectName || "Projeto sem nome",
                    clientName: clientName || "Cliente não informado",
                    projectDescription: projectDescription || "Descrição não informada",
                    totalValue: Math.max(0, totalValue), // Garantir que não seja negativo
                    tipoOrcamento: "price",
                    subTitle: projectName,
                    // Campos específicos do orçamento por preço
                    currency: selectedCurrency || "BRL",
                    state: selectedState || "Estado não selecionado",
                    workArea: workArea || 0,
                    workModel: workModel || "Modelo não selecionado",
                    workStandard: workStandard || "Padrão não selecionado",
                    projectStandard: projectStandard || "Padrão de projeto não selecionado",
                    customValue: customValue || 0,
                    engineeringProjects: engineeringProjects || {},
                    architecturalProjects: architecturalProjects || {},
                    customCategories: customCategories || [],
                    projectValues: projectValues || [],
                    prazoEmMeses: prazoEmMeses || 0,
                    // Campos de ajuste de valores
                    adicionalValor: adicional,
                    desconto: descontoValue,
                    tipoDesconto: tipoDesconto || "percentual",
                    // Valor base para cálculos
                    baseValue: baseValue,
                };

                // Salvar no localStorage
                localStorage.setItem(
                    "budgetPricePreviewData",
                    JSON.stringify(previewData)
                );
                toast.success("Preview do orçamento gerado com sucesso!");
                // Redirecionar para a página de preview
                window.open("/orcamento/preview", "_blank");
                //finishBudget();
            } else {
                toast.error(data.error || "Erro ao criar orçamento por preço");
            }
        } catch (e) {
            toast.error("Erro ao criar orçamento por preço. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (budgetStep) {
            case 1:
                return (
                    <div className="mb-12">
                        <h3 className="text-xl font-semibold mb-6">Quem é seu cliente?</h3>

                        <div className="space-y-4 mb-8 bg-white">
                            <div className="border rounded-lg p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Nome do cliente</h4>
                                    <span className="text-xs text-gray-500">Opcional</span>
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div
                                            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <UserIcon className="h-4 w-4 text-gray-400"/>
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className="pl-10 pr-4 py-2 w-full border rounded-md text-sm"
                                            placeholder="Selecione um cliente ou crie um novo"
                                            value={clientSearch}
                                            onChange={(e) => {
                                                setClientSearch(e.target.value);
                                                setClientId(null);
                                            }}
                                            autoComplete="off"
                                            onClick={() => setShowClientsModal(true)}
                                            readOnly
                                        />
                                    </div>
                                    <Button
                                        className="bg-indigo-600 text-white"
                                        onClick={() => setShowClientsModal(true)}
                                    >
                                        Selecionar
                                    </Button>
                                </div>

                                {clientId &&
                                    (() => {
                                        const selectedClient = clients.find(
                                            (c: { id: string; }) => c.id === clientId
                                        );
                                        if (!selectedClient) return null;

                                        return (
                                            <div className="mt-3 p-3 bg-indigo-50 rounded-md">
                                                <div className="flex items-center gap-3">
                                                    {selectedClient.photoUrl ? (
                                                        <img
                                                            src={selectedClient.photoUrl}
                                                            alt={selectedClient.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span
                                                            className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                              {selectedClient.name.charAt(0)}
                            </span>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {selectedClient.name}
                                                        </div>
                                                        {selectedClient.email && (
                                                            <div className="text-xs text-gray-500">
                                                                {selectedClient.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="ml-auto text-red-600 hover:text-red-700"
                                                        onClick={() => {
                                                            setClientId(null);
                                                            setClientSearch("");
                                                        }}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })()}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-6">
                                Qual é o nome do projeto?
                            </h3>

                            <div className="border rounded-lg p-5 bg-indigo-50 border-indigo-600">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-5 h-5 rounded-full border border-indigo-600 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                    </div>
                                    <h4 className="font-medium">Nome do projeto</h4>
                                </div>

                                <div className="pl-8">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Nomeie para você achar depois
                                    </p>
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            className="px-4 py-2 w-full border rounded-md text-sm"
                                            placeholder="Edifício Comercial Centro"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Descrição</p>
                                        <textarea
                                            className="px-4 py-2 w-full border rounded-md text-sm"
                                            placeholder="Descrição"
                                            rows={3}
                                            value={projectDescription}
                                            onChange={(e) => setProjectDescription(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Caso seja necessário, descreva melhor
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="mb-12">
                        {/* Banner explicativo */}
                        <div
                            className="bg-white rounded-3xl p-8 mb-12 relative overflow-hidden shadow-sm border h-[250px] w-full">
                            {/* Círculo decorativo menor */}
                            <div
                                className="absolute left-[45%] top-[-80%] w-[150px] h-[150px] bg-[#4338CA] rounded-full opacity-20"></div>
                            {/* Círculo principal */}
                            <div
                                className="absolute right-[-5%] top-[-80%] w-[300px] h-[300px] bg-[#4338CA] rounded-full"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="max-w-[65%]">
                                    <h2 className="text-2xl font-bold mb-2">
                                        Entenda o orçamento baseado na obra
                                    </h2>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        O orçamento por preço de obra segue os valores do Sinduscon,
                                        que define o custo médio por metro quadrado nos estados
                                        brasileiros. O orçamento do Limify incorpora esse valor como
                                        base para precificar seu projeto. O CUB não inclui fundação
                                        e ar condicionado, pois esses valores variam conforme a
                                        região.
                                    </p>
                                </div>
                                <div className="relative mt-2">
                                    <img
                                        src={LimifyPuppet.src}
                                        alt="Document illustration"
                                        className="w-[200px] h-[200px] object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seleção de moeda */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold mb-6">Qual vai ser a moeda?</h3>
                            <div className="flex gap-4">
                                <div
                                    className={`border rounded-xl p-5 cursor-pointer flex-1 ${
                                        selectedCurrency === "BRL"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "bg-white"
                                    }`}
                                    onClick={() => setSelectedCurrency("BRL")}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                selectedCurrency === "BRL" ? "border-indigo-600" : ""
                                            }`}
                                        >
                                            {selectedCurrency === "BRL" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Real brasileiro</h4>
                                            <p className="text-sm text-gray-500">BRL – R$</p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`border rounded-xl p-5 cursor-pointer flex-1 ${
                                        selectedCurrency === "USD"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "bg-white"
                                    }`}
                                    onClick={() => setSelectedCurrency("USD")}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                selectedCurrency === "USD" ? "border-indigo-600" : ""
                                            }`}
                                        >
                                            {selectedCurrency === "USD" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Dólar americano</h4>
                                            <p className="text-sm text-gray-500">USD – $</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seleção de região */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold mb-6">
                                Qual região a obra se encontra?
                            </h3>
                            <div className="relative">
                                <div className="absolute left-1 top-3 flex items-center pl-3 pointer-events-none z-10">
                                    <div className="w-5 h-5 bg-[#4338CA] rounded flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M21 21l-4.35-4.35"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <circle
                                                cx="11"
                                                cy="11"
                                                r="7"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-4 py-2 pl-12 pr-10 h-10"
                                    placeholder="Buscar estado..."
                                    value={stateSearch}
                                    onChange={(e) => {
                                        setStateSearch(e.target.value);
                                        setShowStateDropdown(true);
                                    }}
                                    onFocus={() => setShowStateDropdown(true)}
                                    onBlur={() => {
                                        // Delay para permitir clicar no dropdown
                                        setTimeout(() => setShowStateDropdown(false), 200);
                                    }}
                                />
                                <div className="absolute top-3 right-0 flex items-center pr-3 pointer-events-none z-10">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M6 9l6 6 6-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                {/* Dropdown de estados */}
                                {showStateDropdown && stateSearch && (
                                    <div
                                        className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredStates.length > 0 ? (
                                            filteredStates.map((state) => (
                                                <div
                                                    key={state.uf}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                    onClick={() => {
                                                        setSelectedState(state.uf);
                                                        setStateSearch(`${state.uf} - ${state.name}`);
                                                        setShowStateDropdown(false);
                                                        // Buscar valores do Sinduscon para o estado selecionado
                                                        fetchSindusconValues(state.uf);
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{state.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {state.uf}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400">Estado</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-gray-500">
                                                Nenhum estado encontrado
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Estado selecionado */}
                                {selectedState && (
                                    <div className="mt-3 p-3 bg-indigo-50 rounded-md border border-indigo-200">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {selectedState}
                        </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {
                                                        brazilianStates.find((s) => s.uf === selectedState)
                                                            ?.name
                                                    }
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Estado selecionado
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-auto text-red-600 hover:text-red-700"
                                                onClick={() => {
                                                    setSelectedState("");
                                                    setStateSearch("");
                                                }}
                                            >
                                                Remover
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metragem da obra */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold mb-6">Metragem da obra</h3>
                            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-medium">
                                            Quantos metros quadrados a obra vai ter?
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div
                                            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <polyline
                                                    points="9,22 9,12 15,12 15,22"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            className="w-48 border border-indigo-300 rounded-lg px-4 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                            placeholder="1000 M²"
                                            value={workArea || ""}
                                            onChange={(e) => setWorkArea(Number(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="mb-12">
                        {/* Modelo de obra */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold mb-6">
                                Qual modelo de obra vamos orçar?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        workModel === "comercial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "bg-white hover:border-gray-300"
                                    }`}
                                    onClick={() => setWorkModel("comercial")}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                workModel === "comercial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {workModel === "comercial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Comercial</h4>
                                            <p className="text-sm text-gray-500">
                                                Comercial andares livres, salas e lojas
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        workModel === "residencial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "bg-white hover:border-gray-300"
                                    }`}
                                    onClick={() => setWorkModel("residencial")}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                workModel === "residencial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {workModel === "residencial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Residêncial</h4>
                                            <p className="text-sm text-gray-500">
                                                Baseado em padrão baixo, médio e alto
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        workModel === "especiais"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "bg-white hover:border-gray-300"
                                    }`}
                                    onClick={() => setWorkModel("especiais")}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                workModel === "especiais"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {workModel === "especiais" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Especiais</h4>
                                            <p className="text-sm text-gray-500">
                                                Galpão e residência popular e benifíciados
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Padrão a seguir */}
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-2xl font-bold">
                                    Qual padrão vamos seguir?
                                </h3>
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">i</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Padrão baixo */}
                                <div
                                    className={`border rounded-lg p-5 transition-colors ${
                                        workModel === 'residencial'
                                            ? workStandard === 'baixo'
                                                ? 'border-indigo-600 bg-indigo-50 cursor-pointer'
                                                : 'bg-white hover:border-gray-300 cursor-pointer'
                                            : 'bg-gray-100 cursor-not-allowed opacity-50'
                                    }`}
                                    onClick={() => {
                                        if (workModel === 'residencial') {
                                            setWorkStandard('baixo');
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                workStandard === 'baixo' ? 'border-indigo-600' : 'border-gray-300'
                                            }`}
                                        >
                                            {workStandard === 'baixo' && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Padrão baixo</h4>
                                            <p className="text-sm text-gray-500">
                                                R-1, PP-4, R-8 e PIS.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Padrão médio */}
                                <div
                                    className={`border rounded-lg p-5 transition-colors ${
                                        workModel === 'especiais'
                                            ? 'border-indigo-600 bg-indigo-50 cursor-not-allowed'
                                            : workStandard === 'medio'
                                                ? 'border-indigo-600 bg-indigo-50 cursor-pointer'
                                                : 'bg-white hover:border-gray-300 cursor-pointer'
                                    }`}
                                    onClick={() => {
                                        if (workModel !== 'especiais') {
                                            setWorkStandard('medio');
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                workStandard === 'medio' ? 'border-indigo-600' : 'border-gray-300'
                                            }`}
                                        >
                                            {workStandard === 'medio' && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Padrão médio</h4>
                                            <p className="text-sm text-gray-500">
                                                R-1, PP-4, R-8, R-16, CAL-8, CSL-8, CSL-16.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Padrão alto */}
                                <div
                                    className={`border rounded-lg p-5 transition-colors ${
                                        workModel === 'comercial' || workModel === 'residencial'
                                            ? workStandard === 'alto'
                                                ? 'border-indigo-600 bg-indigo-50 cursor-pointer'
                                                : 'bg-white hover:border-gray-300 cursor-pointer'
                                            : 'bg-gray-100 cursor-not-allowed opacity-50'
                                    }`}
                                    onClick={() => {
                                        if (workModel === 'comercial' || workModel === 'residencial') {
                                            setWorkStandard('alto');
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                workStandard === 'alto' ? 'border-indigo-600' : 'border-gray-300'
                                            }`}
                                        >
                                            {workStandard === 'alto' && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Padrão alto</h4>
                                            <p className="text-sm text-gray-500">
                                                R-8, R-16, CAL-8, CSL-8 e CSL-16.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Padrão do projeto */}
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <h3 className="text-2xl font-bold">
                                    Qual vai ser o padrão do projeto?
                                </h3>
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">i</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* R-1 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        (projectStandard === "r1" && workModel === "residencial")
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("r1")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("r1") && setProjectStandard("r1")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                (projectStandard === "r1" && workModel === "residencial")
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "r1" && workModel === "residencial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">R-1</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.r1
                                                    ? sindusconValues.r1.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Residência unifamiliar baixa densidade
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* PP-4 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "pp4" && workModel === "residencial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("pp4")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("pp4") && setProjectStandard("pp4")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "pp4" && workModel === "residencial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "pp4" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">PP-4</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.pp4
                                                    ? sindusconValues.pp4.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Pequeno projeto residencial padrão
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* R-8 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "r8" && workModel === "residencial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("r8")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("r8") && setProjectStandard("r8")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "r8" && workModel === "residencial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "r8" && workModel === "residencial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">R-8</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.r8
                                                    ? sindusconValues.r8.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Res. multifamiliar porte médio
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* R-16 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "r16" && workModel === "residencial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("r16")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("r16") && setProjectStandard("r16")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "r16" && workModel === "residencial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "r16" && workModel === "residencial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">R-16</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.r16
                                                    ? sindusconValues.r16.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Res. multifamiliar grande porte
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* PIS */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "pis" && workModel === "residencial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("pis")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("pis") && setProjectStandard("pis")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "pis" && workModel === "residencial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "pis" && workModel === "residencial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">PIS</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.pis
                                                    ? sindusconValues.pis.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Res. multifamiliar piso
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* CAL-8 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "cal8" && workModel === "comercial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("cal8")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("cal8") && setProjectStandard("cal8")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "cal8" && workModel === "comercial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "cal8" && workModel === "comercial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">CAL-8</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.cal8
                                                    ? sindusconValues.cal8.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Comercial de área livre com padrão normal
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* CSL-8 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "csl8" && workModel === "comercial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("csl8")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("csl8") && setProjectStandard("csl8")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "csl8" && workModel === "comercial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "csl8" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">CSL-8</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.csl8
                                                    ? sindusconValues.r16.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Comercial de salas ou lojas de padrão normal
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* CSL-16 */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "csl16" && workModel === "comercial"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("csl16")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("csl16") && setProjectStandard("csl16")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "csl16" && workModel === "comercial"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "csl16" && workModel === "comercial" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">CSL-16</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.csl16
                                                    ? sindusconValues.r16.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Comercial de sales ou lojas de padrão alto
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* RP1Q */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "rp1q"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("rp1q")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("rp1q") && setProjectStandard("rp1q")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "rp1q"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "rp1q" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">RP1Q</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.rp1q
                                                    ? sindusconValues.r16.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Res. multifamiliar popular
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* GI */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "gi"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("gi")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("gi") && setProjectStandard("gi")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "gi"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "gi" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">GI</h4>
                                            <div
                                                className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
                                                {getCurrencySymbol()}{" "}
                                                {sindusconValues?.gi
                                                    ? sindusconValues.r16.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })
                                                    : "0,00"}{" "}
                                                m²
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Galpão indústrial
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Personalizado */}
                                <div
                                    className={`border rounded-lg p-5 cursor-pointer transition-colors ${
                                        projectStandard === "personalizado"
                                            ? "border-indigo-600 bg-indigo-50"
                                            : canSelectProjectStandard("personalizado")
                                                ? "bg-white hover:border-gray-300"
                                                : "bg-gray-100 cursor-not-allowed opacity-50"
                                    }`}
                                    onClick={() =>
                                        canSelectProjectStandard("personalizado") &&
                                        setProjectStandard("personalizado")
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                                projectStandard === "personalizado"
                                                    ? "border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            {projectStandard === "personalizado" && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Personalizado</h4>
                                            <p className="text-sm text-gray-500 mb-2">
                                                Defina um valor m² personalizado
                                            </p>
                                            {projectStandard === "personalizado" && (
                                                <div className="relative">
                                                    <div
                                                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span
                                                            className="text-gray-500 text-sm">{getCurrencySymbol()}</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-8 pr-4 text-sm"
                                                        placeholder="2500"
                                                        value={customValue || ""}
                                                        onChange={(e) =>
                                                            setCustomValue(Number(e.target.value) || 0)
                                                        }
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variação de valores da obra */}
                        {sindusconValues && workArea > 0 && projectStandard && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold mb-6">
                                    Variação de valores da obra
                                </h3>

                                {/* Indicador de orçamento selecionado */}

                                {/* Cards dos padrões */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {calculateStandardValues()?.map((padrao, index) => (
                                        <div
                                            key={index}
                                            className={`border rounded-lg p-5 transition-colors ${
                                                padrao.isSelected
                                                    ? "border-indigo-600 bg-indigo-50"
                                                    : "bg-white border-gray-200"
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900 mb-2">
                                                    {padrao.formattedValue}
                                                </div>
                                                <div
                                                    className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                                    {padrao.name}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Gráfico */}
                                <div className="bg-white border rounded-lg p-6">
                                    <h4 className="text-lg font-semibold mb-4 text-center">
                                        Variação de valores da obra
                                    </h4>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={calculateStandardValues() || []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                                                <XAxis
                                                    dataKey="name"
                                                    stroke="#6b7280"
                                                    fontSize={12}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    stroke="#6b7280"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickFormatter={(value: number) =>
                                                        `${getCurrencySymbol()} ${(value / 1000).toFixed(0)}k`
                                                    }
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [
                                                        `${getCurrencySymbol()} ${value.toLocaleString("pt-BR", {
                                                            minimumFractionDigits: 2,
                                                        })}`,
                                                        "Valor",
                                                    ]}
                                                    labelFormatter={(label: any) => label}
                                                    contentStyle={{
                                                        backgroundColor: "white",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "8px",
                                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#4338ca"
                                                    strokeWidth={3}
                                                    dot={{fill: "#4338ca", strokeWidth: 2, r: 6}}
                                                    activeDot={{
                                                        r: 8,
                                                        stroke: "#4338ca",
                                                        strokeWidth: 2,
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="mb-12">
            <span
                className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1 rounded-full mb-3">
              Orçamento # {countBudget + 1 || 0}
            </span>
                        {/* Banner explicativo */}
                        <div
                            className="bg-white rounded-3xl p-8 mb-12 relative overflow-hidden shadow-sm border h-[250px] w-full">
                            {/* Círculo decorativo menor */}
                            <div
                                className="absolute left-[45%] top-[-80%] w-[150px] h-[150px] bg-[#4338CA] rounded-full opacity-20"></div>
                            {/* Círculo principal */}
                            <div
                                className="absolute right-[-5%] top-[-80%] w-[300px] h-[300px] bg-[#4338CA] rounded-full"></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="max-w-[65%]">
                                    <h2 className="text-2xl font-bold mb-2">
                                        Agora vamos para os projetos
                                    </h2>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Nesta etapa, conseguimos saber o valor da obra para a sua
                                        região, em valores concretos, baseados em obras reais. Nesta
                                        próxima etapa, você vai definir a porcentagem que quer para
                                        o seu projeto, e desta forma, o Limify vai calcular
                                        automaticamente para você o valor do projeto.
                                    </p>
                                </div>
                                <div className="relative mt-2">
                                    <img
                                        src={LimifyAdditionalPuppet.src}
                                        alt="Additional illustration"
                                        className="w-[200px] h-[200px] object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seleção de projetos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Engenharia */}
                            <div className="bg-white rounded-xl border shadow-sm">
                                <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-xl">
                                    <h3 className="font-medium">Engenharia</h3>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold mb-4">
                                        O que vamos orçar?
                                    </h4>

                                    <div className="space-y-3">
                                        {/* Execução da obra */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Execução da obra
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.execucaoObra}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            execucaoObra: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.execucaoObra
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            execucaoObra: !prev.execucaoObra,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.execucaoObra
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estrutural */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Estrutural
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.estrutural}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            estrutural: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.estrutural
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            estrutural: !prev.estrutural,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.estrutural
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prevenção de incêndio */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Prevenção de incêndio
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.prevencaoIncendio}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            prevencaoIncendio: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.prevencaoIncendio
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            prevencaoIncendio: !prev.prevencaoIncendio,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.prevencaoIncendio
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Elétrico */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Elétrico
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.eletrico}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            eletrico: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.eletrico
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            eletrico: !prev.eletrico,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.eletrico
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hidrossanitário */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Hidrossanitário
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.hidrossanitario}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            hidrossanitario: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.hidrossanitario
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            hidrossanitario: !prev.hidrossanitario,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.hidrossanitario
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fundação */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Fundação
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.fundacao}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            fundacao: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.fundacao
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            fundacao: !prev.fundacao,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.fundacao
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenção */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Contenção
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.contencao}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            contencao: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.contencao
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            contencao: !prev.contencao,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.contencao
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SPDA */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                SPDA
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.spda}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            spda: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.spda
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            spda: !prev.spda,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.spda
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outro */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Outro
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={engineeringProjects.outro}
                                                    onChange={(e) =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            outro: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        engineeringProjects.outro
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setEngineeringProjects((prev) => ({
                                                            ...prev,
                                                            outro: !prev.outro,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            engineeringProjects.outro
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campo para categoria personalizada - Engenharia */}
                                    {engineeringProjects.outro && (
                                        <div className="mt-6">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Adicionar categoria personalizada"
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (customCategory.trim()) {
                                                            setCustomCategories([
                                                                ...customCategories,
                                                                customCategory.trim(),
                                                            ]);
                                                            setCustomCategory("");
                                                        }
                                                    }}
                                                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M12 5V19M5 12H19"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Categorias personalizadas adicionadas */}
                                            {customCategories.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {customCategories.map((category, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2"
                                                        >
                              <span className="text-sm text-gray-700">
                                {category}
                              </span>
                                                            <button
                                                                onClick={() =>
                                                                    setCustomCategories(
                                                                        customCategories.filter(
                                                                            (_, i) => i !== index
                                                                        )
                                                                    )
                                                                }
                                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <svg
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M18 6L6 18M6 6l12 12"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Arquitetônico */}
                            <div className="bg-white rounded-xl border shadow-sm">
                                <div className="bg-indigo-600 text-white px-4 py-2 rounded-t-xl">
                                    <h3 className="font-medium">Arquitetônico</h3>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-lg font-semibold mb-4">
                                        O que vamos orçar?
                                    </h4>

                                    <div className="space-y-3">
                                        {/* Arquitetônico */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Arquitetonico
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={architecturalProjects.arquitetonico}
                                                    onChange={(e) =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            arquitetonico: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        architecturalProjects.arquitetonico
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            arquitetonico: !prev.arquitetonico,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            architecturalProjects.arquitetonico
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interiores */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Interiores
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={architecturalProjects.interiores}
                                                    onChange={(e) =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            interiores: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        architecturalProjects.interiores
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            interiores: !prev.interiores,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            architecturalProjects.interiores
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Render */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Render
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={architecturalProjects.render}
                                                    onChange={(e) =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            render: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        architecturalProjects.render
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            render: !prev.render,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            architecturalProjects.render
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Iluminação */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Iluminação
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={architecturalProjects.iluminacao}
                                                    onChange={(e) =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            iluminacao: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        architecturalProjects.iluminacao
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            iluminacao: !prev.iluminacao,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            architecturalProjects.iluminacao
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outro */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700">
                                                Outro
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={architecturalProjects.outro}
                                                    onChange={(e) =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            outro: e.target.checked,
                                                        }))
                                                    }
                                                    className="sr-only"
                                                />
                                                <div
                                                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                                        architecturalProjects.outro
                                                            ? "bg-indigo-600"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() =>
                                                        setArchitecturalProjects((prev) => ({
                                                            ...prev,
                                                            outro: !prev.outro,
                                                        }))
                                                    }
                                                >
                                                    <div
                                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                                            architecturalProjects.outro
                                                                ? "translate-x-5"
                                                                : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Campo para categoria personalizada - Arquitetônico */}
                                    {architecturalProjects.outro && (
                                        <div className="mt-6">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Adicionar categoria personalizada"
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (customCategory.trim()) {
                                                            setCustomCategories([
                                                                ...customCategories,
                                                                customCategory.trim(),
                                                            ]);
                                                            setCustomCategory("");
                                                        }
                                                    }}
                                                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M12 5V19M5 12H19"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Categorias personalizadas adicionadas */}
                                            {customCategories.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {customCategories.map((category, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2"
                                                        >
                              <span className="text-sm text-gray-700">
                                {category}
                              </span>
                                                            <button
                                                                onClick={() =>
                                                                    setCustomCategories(
                                                                        customCategories.filter(
                                                                            (_, i) => i !== index
                                                                        )
                                                                    )
                                                                }
                                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                                            >
                                                                <svg
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M18 6L6 18M6 6l12 12"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabela de valores */}
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Tabela de valores</h3>

                            {/* Campo de prazo para fim da obra */}
                            <div className="mb-6">
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg mb-2">
                                                Prazo para fim da obra
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                Defina o prazo estimado para conclusão da obra
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center border border-gray-300 rounded-lg bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPrazoEmMeses(Math.max(1, prazoEmMeses - 1))
                                                    }
                                                    className="px-3 py-2 text-purple-600 hover:bg-purple-50 transition-colors rounded-l-lg"
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M20 12H4"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                                <input
                                                    type="number"
                                                    value={prazoEmMeses}
                                                    onChange={(e) =>
                                                        setPrazoEmMeses(
                                                            Math.max(1, parseInt(e.target.value) || 1)
                                                        )
                                                    }
                                                    className="w-16 text-center border-0 focus:ring-0 text-lg font-semibold"
                                                    min="1"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setPrazoEmMeses(prazoEmMeses + 1)}
                                                    className="px-3 py-2 text-purple-600 hover:bg-purple-50 transition-colors rounded-r-lg"
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M12 4v16m8-8H4"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                            <span className="text-gray-700 font-medium">Meses</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Valor base do cálculo */}
                            <div className="mb-4 flex items-center justify-end">
                                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Valor base do cálculo:
                  </span>
                                    <span className="text-lg font-bold text-indigo-600">
                    {getCurrencySymbol()}{" "}
                                        {calculateBaseValue().toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                        })}
                  </span>
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">i</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Nome
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Parcelado?
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Valor da parcela
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Porcentagem da obra
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Valor do orçamento
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {projectValues.map((project) => (
                                        <tr key={project.id} className="border-b last:border-b-0">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {project.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {project.isEditingField === "installmentCount" ? (
                                                    <input
                                                        type="number"
                                                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        value={project.installmentCount || ""}
                                                        onChange={(e) =>
                                                            updateProjectValue(
                                                                project.id,
                                                                "installmentCount",
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        onBlur={() => finishProjectEdit(project.id)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === "Enter") {
                                                                finishProjectEdit(project.id);
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm"
                                                        onClick={() =>
                                                            startProjectEdit(project.id, "installmentCount")
                                                        }
                                                    >
                                                        {project.isInstallment
                                                            ? `${project.installmentCount}x`
                                                            : "Não"}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {project.isEditingField === "installmentValue" ? (
                                                    <input
                                                        type="number"
                                                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        value={project.installmentValue || 0}
                                                        onChange={(e) =>
                                                            updateProjectValue(
                                                                project.id,
                                                                "installmentValue",
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        onBlur={() => finishProjectEdit(project.id)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === "Enter") {
                                                                finishProjectEdit(project.id);
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm"
                                                        onClick={() =>
                                                            startProjectEdit(project.id, "installmentValue")
                                                        }
                                                    >
                                                        {project.isInstallment
                                                            ? `${getCurrencySymbol()} ${project.installmentValue.toLocaleString(
                                                                "pt-BR",
                                                                {minimumFractionDigits: 2}
                                                            )}`
                                                            : "-"}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {project.isEditingField === "projectPercentage" ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                                        value={project.projectPercentage || ""}
                                                        onChange={(e) =>
                                                            updateProjectValue(
                                                                project.id,
                                                                "projectPercentage",
                                                                Number(e.target.value) || 0
                                                            )
                                                        }
                                                        onBlur={() => finishProjectEdit(project.id)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === "Enter") {
                                                                finishProjectEdit(project.id);
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div
                                                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-sm"
                                                        onClick={() =>
                                                            startProjectEdit(
                                                                project.id,
                                                                "projectPercentage"
                                                            )
                                                        }
                                                    >
                                                        {project.projectPercentage}%
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {getCurrencySymbol()}{" "}
                                                    {project.budgetValue.toLocaleString("pt-BR", {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total projetos */}
                            <div className="flex justify-end mt-6">
                                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Total projetos
                  </span>
                                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg px-6 py-3">
                    <span className="text-xl font-bold text-gray-900">
                      {getCurrencySymbol()}{" "}
                        {calculateTotalProjects().toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                        })}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Total de porcentagem */}
                            <div className="flex justify-end mt-4">
                                <div className="flex items-center gap-4">
                  <span
                      className={`text-lg font-semibold ${
                          isPercentageValid() ? "text-gray-900" : "text-red-600"
                      }`}
                  >
                    Total de porcentagem
                  </span>
                                    <div
                                        className={`border-2 rounded-lg px-6 py-3 ${
                                            isPercentageValid()
                                                ? "bg-green-50 border-green-200"
                                                : "bg-red-50 border-red-200"
                                        }`}
                                    >
                    <span
                        className={`text-xl font-bold ${
                            isPercentageValid() ? "text-green-700" : "text-red-700"
                        }`}
                    >
                      {calculateTotalPercentage()}%
                    </span>
                                    </div>
                                    {!isPercentageValid() && (
                                        <div className="text-red-600 text-sm">
                                            ⚠️ Soma ultrapassa 100%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ajuste de valores (Opcional) */}
                        <div className="mt-12">
                            <h3 className="text-2xl font-bold mb-6">
                                Ajuste de valores (Opcional)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Acrescentar valor */}
                                <div
                                    className={`border rounded-lg p-5 relative bg-white cursor-pointer transition-colors ${
                                        opcoesAjusteValor.includes("adicional")
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "hover:border-gray-300"
                                    }`}
                                    onClick={() => {
                                        const newOpcoes = opcoesAjusteValor.includes("adicional")
                                            ? opcoesAjusteValor.filter((op) => op !== "adicional")
                                            : [...opcoesAjusteValor, "adicional"];
                                        setOpcoesAjusteValor(newOpcoes);
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                                                opcoesAjusteValor.includes("adicional")
                                                    ? "border-indigo-600"
                                                    : ""
                                            }`}
                                        >
                                            {opcoesAjusteValor.includes("adicional") && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Acrescentar valor</h4>
                                            <p className="text-sm text-gray-500">
                                                Acrescente um valor de fechamento
                                            </p>
                                        </div>
                                    </div>

                                    {opcoesAjusteValor.includes("adicional") && (
                                        <div className="pl-8">
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 text-sm">{getCurrencySymbol()}</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    className="pl-8 pr-4 py-2 w-full border border-indigo-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                                    placeholder="100"
                                                    value={adicionalValor || ""}
                                                    onChange={(e) => {
                                                        setAdicionalValor(Number(e.target.value) || 0);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dar desconto */}
                                <div
                                    className={`border rounded-lg p-5 relative bg-white cursor-pointer transition-colors ${
                                        opcoesAjusteValor.includes("desconto")
                                            ? "border-indigo-600 bg-indigo-50"
                                            : "hover:border-gray-300"
                                    }`}
                                    onClick={() => {
                                        const newOpcoes = opcoesAjusteValor.includes("desconto")
                                            ? opcoesAjusteValor.filter((op) => op !== "desconto")
                                            : [...opcoesAjusteValor, "desconto"];
                                        setOpcoesAjusteValor(newOpcoes);
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                                                opcoesAjusteValor.includes("desconto")
                                                    ? "border-indigo-600"
                                                    : ""
                                            }`}
                                        >
                                            {opcoesAjusteValor.includes("desconto") && (
                                                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Dar desconto</h4>
                                            <p className="text-sm text-gray-500">
                                                Valor ou porcentagem
                                            </p>
                                        </div>
                                    </div>

                                    {opcoesAjusteValor.includes("desconto") && (
                                        <div className="pl-8">
                                            <div className="flex items-center gap-3">
                                                {/* Toggle para alternar entre valor e porcentagem */}
                                                <div
                                                    className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        type="button"
                                                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                                                            tipoDesconto === "valor"
                                                                ? "bg-indigo-600 text-white border-b border-gray-200"
                                                                : "bg-gray-100 text-gray-500"
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTipoDesconto("valor");
                                                        }}
                                                    >
                                                        {getCurrencySymbol()}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                                                            tipoDesconto === "percentual"
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-gray-100 text-gray-500"
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTipoDesconto("percentual");
                                                        }}
                                                    >
                                                        %
                                                    </button>
                                                </div>

                                                {/* Campo de input estilizado */}
                                                <div className="relative flex-1">
                                                    <div
                                                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">
                              {tipoDesconto === "valor" ? selectedCurrency === "USD" ? "$" : "R$" : "%"}
                            </span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        className="pl-8 pr-4 py-2 w-full border border-indigo-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                                        placeholder={
                                                            tipoDesconto === "percentual" ? "10" : "100"
                                                        }
                                                        value={desconto || ""}
                                                        onChange={(e) => {
                                                            setDesconto(Number(e.target.value) || 0);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resumo final */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-white rounded-md border">
                                    <h4 className="text-sm text-gray-500 mb-2">Preço médio m²</h4>
                                    <p className="text-3xl font-bold">
                                        {getCurrencySymbol()} {Math.round(calculateBaseValue() / (workArea || 1))}
                                    </p>
                                </div>

                                <div className="p-6 bg-indigo-50 rounded-md border-2 border-indigo-200">
                                    <h4 className="text-sm text-gray-500 mb-2">
                                        Valor final do orçamento
                                    </h4>
                                    <p className="text-3xl font-bold text-indigo-700">
                                        {getCurrencySymbol()}{" "}
                                        {Math.round(
                                            calculateBaseValue() +
                                            (opcoesAjusteValor.includes("adicional")
                                                ? adicionalValor
                                                : 0) -
                                            (opcoesAjusteValor.includes("desconto")
                                                ? tipoDesconto === "percentual"
                                                    ? calculateBaseValue() * (desconto / 100)
                                                    : desconto
                                                : 0)
                                        )}
                                    </p>
                                    {opcoesAjusteValor.includes("adicional") &&
                                        adicionalValor > 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Adicional: {getCurrencySymbol()} {adicionalValor}
                                            </p>
                                        )}
                                    {opcoesAjusteValor.includes("desconto") && desconto > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Desconto:{" "}
                                            {tipoDesconto === "percentual"
                                                ? `${desconto}%`
                                                : `${getCurrencySymbol()} ${desconto}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Função para calcular o valor base do cálculo
    const calculateBaseValue = () => {
        try {
            if (!sindusconValues || !workArea || !projectStandard || !workStandard) {
                console.log("Valores necessários não encontrados:", {
                    sindusconValues: !!sindusconValues,
                    workArea,
                    projectStandard,
                    workStandard,
                });
                return 0;
            }

            let baseValue = 0;

            // Pegar o valor base do padrão selecionado
            switch (projectStandard) {
                case "r1":
                    baseValue = sindusconValues.r1 || 0;
                    break;
                case "pp4":
                    baseValue = sindusconValues.pp4 || 0;
                    break;
                case "r8":
                    baseValue = sindusconValues.r8 || 0;
                    break;
                case "r16":
                    baseValue = sindusconValues.r16 || 0;
                    break;
                case "personalizado":
                    baseValue = customValue || 0;
                    break;
                default:
                    console.log("Padrão de projeto não reconhecido:", projectStandard);
                    return 0;
            }

            // Aplicar o multiplicador baseado no workStandard selecionado na etapa 3
            let multiplier = 1; // Padrão médio
            if (workStandard === "baixo") {
                multiplier = 0.625; // 62.5% do valor base
            } else if (workStandard === "alto") {
                multiplier = 2; // 200% do valor base
            }

            const result = baseValue * workArea * multiplier;
            console.log("Cálculo do valor base:", {
                baseValue,
                workArea,
                multiplier,
                result,
            });

            return result;
        } catch (error) {
            console.error("Erro na função calculateBaseValue:", error);
            return 0;
        }
    };

    // Função para gerar projetos baseados nas seleções
    const generateProjectValues = () => {
        const projects: typeof projectValues = [];
        let id = 1;
        let totalPercentage = 0;

        // Adicionar projetos de engenharia selecionados
        Object.entries(engineeringProjects).forEach(([key, isSelected]) => {
            if (isSelected && key !== "outro") {
                const projectName =
                    key === "execucaoObra"
                        ? "Execução da obra"
                        : key === "estrutural"
                            ? "Estrutural"
                            : key === "prevencaoIncendio"
                                ? "Prevenção de incêndio"
                                : key === "eletrico"
                                    ? "Elétrico"
                                    : key === "hidrossanitario"
                                        ? "Hidrossanitário"
                                        : key === "fundacao"
                                            ? "Fundação"
                                            : key === "contencao"
                                                ? "Contenção"
                                                : key === "spda"
                                                    ? "SPDA"
                                                    : key;

                // Definir porcentagem padrão para cada tipo de projeto
                let defaultPercentage = 1; // 1% padrão
                if (key === "execucaoObra") {
                    defaultPercentage = 6; // 6% para execução da obra
                } else if (key === "estrutural") {
                    defaultPercentage = 8; // 8% para estrutural
                } else if (key === "prevencaoIncendio") {
                    defaultPercentage = 3; // 3% para prevenção de incêndio
                } else if (key === "eletrico") {
                    defaultPercentage = 4; // 4% para elétrico
                } else if (key === "hidrossanitario") {
                    defaultPercentage = 5; // 5% para hidrossanitário
                } else if (key === "fundacao") {
                    defaultPercentage = 7; // 7% para fundação
                } else if (key === "contencao") {
                    defaultPercentage = 4; // 4% para contenção
                } else if (key === "spda") {
                    defaultPercentage = 2; // 2% para SPDA
                }

                // Verificar se a porcentagem não ultrapassa o limite
                if (totalPercentage + defaultPercentage <= 100) {
                    totalPercentage += defaultPercentage;

                    // Calcular o valor do orçamento baseado na porcentagem
                    const baseValue = calculateBaseValue();
                    const budgetValue = (baseValue * defaultPercentage) / 100;

                    projects.push({
                        id: `eng_${id++}`,
                        name: projectName,
                        isInstallment: key === "execucaoObra", // Execução da obra é parcelado por padrão
                        installmentCount: key === "execucaoObra" ? 10 : 0,
                        installmentValue: key === "execucaoObra" ? budgetValue / 10 : 0,
                        projectPercentage: defaultPercentage,
                        budgetValue: budgetValue,
                    });
                }
            }
        });

        // Adicionar projetos arquitetônicos selecionados
        Object.entries(architecturalProjects).forEach(([key, isSelected]) => {
            if (isSelected && key !== "outro") {
                const projectName =
                    key === "arquitetonico"
                        ? "Arquitetônico"
                        : key === "interiores"
                            ? "Interiores"
                            : key === "render"
                                ? "Render"
                                : key === "iluminacao"
                                    ? "Iluminação"
                                    : key;

                // Definir porcentagem padrão para projetos arquitetônicos
                let defaultPercentage = 2; // 2% padrão para projetos arquitetônicos
                if (key === "arquitetonico") {
                    defaultPercentage = 3; // 3% para arquitetônico
                } else if (key === "interiores") {
                    defaultPercentage = 4; // 4% para interiores
                } else if (key === "render") {
                    defaultPercentage = 2; // 2% para render
                } else if (key === "iluminacao") {
                    defaultPercentage = 2; // 2% para iluminação
                }

                // Verificar se a porcentagem não ultrapassa o limite
                if (totalPercentage + defaultPercentage <= 100) {
                    totalPercentage += defaultPercentage;

                    // Calcular o valor do orçamento baseado na porcentagem
                    const baseValue = calculateBaseValue();
                    const budgetValue = (baseValue * defaultPercentage) / 100;

                    projects.push({
                        id: `arch_${id++}`,
                        name: projectName,
                        isInstallment: false,
                        installmentCount: 0,
                        installmentValue: 0,
                        projectPercentage: defaultPercentage,
                        budgetValue: budgetValue,
                    });
                }
            }
        });

        // Adicionar categorias personalizadas (com porcentagem ajustada)
        if (customCategories.length > 0) {
            const remainingPercentage = 100 - totalPercentage;
            const percentagePerCategory = Math.max(
                1,
                Math.floor(remainingPercentage / customCategories.length)
            );

            customCategories.forEach((category, index) => {
                // Para a última categoria, usar o restante da porcentagem
                const finalPercentage =
                    index === customCategories.length - 1
                        ? remainingPercentage -
                        percentagePerCategory * (customCategories.length - 1)
                        : percentagePerCategory;

                if (finalPercentage > 0) {
                    // Calcular o valor do orçamento baseado na porcentagem
                    const baseValue = calculateBaseValue();
                    const budgetValue = (baseValue * finalPercentage) / 100;

                    projects.push({
                        id: `custom_${id++}`,
                        name: category,
                        isInstallment: false,
                        installmentCount: 0,
                        installmentValue: 0,
                        projectPercentage: finalPercentage,
                        budgetValue: budgetValue,
                    });
                }
            });
        }

        setProjectValues(projects);
    };

    // Função para atualizar valores inline
    const updateProjectValue = (
        projectId: string,
        field: "installmentCount" | "installmentValue" | "projectPercentage",
        value: number
    ) => {
        setProjectValues((prevProjects) => {
            // Se estiver editando a porcentagem, validar se não ultrapassa 100%
            if (field === "projectPercentage") {
                const currentProject = prevProjects.find((p) => p.id === projectId);
                if (currentProject) {
                    const otherProjectsTotal = prevProjects
                        .filter((p) => p.id !== projectId)
                        .reduce((sum, p) => sum + p.projectPercentage, 0);

                    const newTotal = otherProjectsTotal + value;

                    // Se ultrapassar 100%, ajustar para o máximo possível
                    if (newTotal > 100) {
                        value = Math.max(1, 100 - otherProjectsTotal);
                        toast.warning(
                            `Porcentagem ajustada para ${value}% para não ultrapassar 100%`
                        );
                    }
                }
            }

            return prevProjects.map((project) => {
                if (project.id === projectId) {
                    const updatedProject = {...project, [field]: value};

                    // Recalcular valores baseados nas mudanças
                    if (field === "projectPercentage") {
                        const baseValue = calculateBaseValue();
                        updatedProject.budgetValue = (baseValue * value) / 100;

                        // Recalcular valor da parcela se for parcelado
                        if (
                            updatedProject.isInstallment &&
                            updatedProject.installmentCount > 0
                        ) {
                            updatedProject.installmentValue =
                                updatedProject.budgetValue / updatedProject.installmentCount;
                        }
                    }

                    if (field === "installmentCount" && updatedProject.isInstallment) {
                        updatedProject.installmentValue =
                            updatedProject.budgetValue / value;
                    }

                    return updatedProject;
                }
                return project;
            });
        });
    };

    // Função para finalizar edição inline
    const finishProjectEdit = (projectId: string) => {
        setProjectValues((prevProjects) =>
            prevProjects.map((project) =>
                project.id === projectId
                    ? {...project, isEditingField: null}
                    : project
            )
        );
    };

    // Função para iniciar edição de um campo específico
    const startProjectEdit = (
        projectId: string,
        field: "installmentCount" | "installmentValue" | "projectPercentage"
    ) => {
        setProjectValues((prevProjects) =>
            prevProjects.map((project) =>
                project.id === projectId
                    ? {...project, isEditingField: field}
                    : project
            )
        );
    };

    // Calcular total dos projetos
    const calculateTotalProjects = () => {
        return projectValues.reduce((sum, project) => sum + project.budgetValue, 0);
    };

    // Calcular total de porcentagem
    const calculateTotalPercentage = () => {
        return projectValues.reduce(
            (sum, project) => sum + project.projectPercentage,
            0
        );
    };

    // Verificar se a porcentagem total está válida
    const isPercentageValid = () => {
        const total = calculateTotalPercentage();
        return total <= 100;
    };

    // Estado para o prazo da obra
    const [prazoEmMeses, setPrazoEmMeses] = useState(10);

    return (
        <>
            <div className="max-w-6xl mx-auto w-full py-6 px-6">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div className="flex-1">
                            <div className="w-full h-1 bg-gray-200 rounded-full">
                                <div
                                    className="h-1 bg-indigo-600 rounded-full"
                                    style={{
                                        width:
                                            budgetStep === 1
                                                ? "25%"
                                                : budgetStep === 2
                                                    ? "50%"
                                                    : budgetStep === 3
                                                        ? "75%"
                                                        : "100%",
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="ml-4 text-sm font-medium text-gray-600">
                            Etapa {budgetStep} de 4
                        </div>
                    </div>
                </div>

                {renderStepContent()}

                <div className="flex justify-between">
                    {budgetStep > 1 && (
                        <Button
                            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                            onClick={() => setBudgetStep(budgetStep - 1)}
                        >
                            Voltar
                        </Button>
                    )}

                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 ml-auto"
                        onClick={
                            budgetStep === 4
                                ? handleSubmitBudget
                                : () => {
                                    if (budgetStep === 1) {
                                        setBudgetStep(2);
                                        toast.success("Informações básicas salvas");
                                    } else if (budgetStep === 2) {
                                        setBudgetStep(3);
                                        toast.success("Preferências salvas");
                                    } else if (budgetStep === 3) {
                                        setBudgetStep(4);
                                        toast.success("Serviços adicionados com sucesso");
                                    }
                                }
                        }
                        disabled={
                            isSubmitting ||
                            (budgetStep === 2 && (!selectedState || workArea <= 0)) ||
                            (budgetStep === 3 &&
                                (!workModel || !workStandard || !projectStandard))
                        }
                    >
                        {isSubmitting
                            ? "Salvando..."
                            : budgetStep === 4
                                ? "Publicar"
                                : "Continuar"}
                    </Button>
                </div>
            </div>

            {/* Modal de criação de cliente */}
            {showClientsModal && (
                <ClientsModal
                    isClientModalOpen={showClientsModal}
                    setIsClientModalOpen={setShowClientsModal}
                    onClientSelect={handleSelectClient}
                />
            )}
        </>
    );
}
