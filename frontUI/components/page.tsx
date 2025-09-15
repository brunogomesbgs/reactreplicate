"use client";

import { useState, useEffect } from "react";
import {FormProvider, useForm} from "react-hook-form";
import {estadosBrasil} from "@/lib/constants/estados";
import {EstadosTable} from "@/components/admin/estados-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, RefreshCw, Download, Upload, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

type Faixa = { baixo?: number; medio?: number; alto?: number };
type EstadoForm = {
    estado: string;
    r1: Faixa;
    pp4: Faixa;
    r8: Faixa;
    r16: Faixa;
    pis: number;
    cal8: Faixa;
    csl8: Faixa;
    csl16: Faixa;
    rp1q: number;
    gi: number;
};
export type Inputs = { estados: EstadoForm[] };

interface SindusconData {
    estado: string;
    r1: Faixa | null;
    pp4: Faixa | null;
    r8: Faixa | null;
    r16: Faixa | null;
    pis: number | null;
    cal8: Faixa | null;
    csl8: Faixa | null;
    csl16: Faixa | null;
    rp1q: number | null;
    gi: number | null;
}

export default function AdminPage() {
    const [sindusconData, setSindusconData] = useState<SindusconData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const form = useForm<Inputs>({
        defaultValues: {
            estados: estadosBrasil.map(e => ({
                estado: e.sigla,
                r1: {baixo: 0, medio: 0, alto: 0},
                pp4: {baixo: 0, medio: 0, alto: 0},
                r8: {baixo: 0, medio: 0, alto: 0},
                r16: {medio: 0, alto: 0},
                pis: 0,
                cal8: {medio: 0, alto: 0},
                csl8: {medio: 0, alto: 0},
                csl16: {medio: 0, alto: 0},
                rp1q: 0,
                gi: 0,
            }))
        }, mode: "onBlur", shouldUnregister: false
    });

    const onSubmit = form.handleSubmit(async (data: Inputs) => {
        // envia values.estados de uma vez
        console.log(data)
        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/sinduscon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mes: currentMonth,
                    ano: currentYear,
                    values: data,
                    estado: data.estados
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao salvar");
            }

            toast.success("Valores salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar os valores");
        } finally {
            setIsLoading(false);
        }
    });

    const exportToCSV = () => {
        const csvContent = [
            "Estado,R1,PP4,R8,R-16,pis,cal8,csl8,csl16,rp1q,gi",
            ...sindusconData.map(
                (row) =>
                    `${row.estado},${row.r1 || ""},${row.pp4 || ""},${row.r8 || ""},${
                        row.r16 || ""},${row.pis || ""},,${row.cal8 || ""},${row.csl8 || ""},
            ${row.csl16 || ""},${row.rp1q || ""},${row.gi || ""}`
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sinduscon-${currentMonth}-${currentYear}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
                        <p className="text-muted-foreground">
                            Gerencie os valores da Sinduscon por estado
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            {currentMonth}/{currentYear}
                        </Badge>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" />
                            Controles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="month">Mês:</Label>
                                <Input
                                    id="month"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={currentMonth}
                                    onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                                    className="w-20"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="year">Ano:</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    min="2020"
                                    max="2030"
                                    value={currentYear}
                                    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                                    className="w-24"
                                />
                            </div>
                            <Button
                                variant="outline"
                                //onClick={handleLoadData}
                                disabled={isLoading}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Carregar
                            </Button>
                            <Button
                                disabled={isLoading}
                                type="submit"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                            </Button>
                            <Button variant="outline" onClick={exportToCSV}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Valores da Sinduscon por Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <EstadosTable />
                        </div>
                    </CardContent>
                </Card>

            </form>
        </FormProvider>
    );
}