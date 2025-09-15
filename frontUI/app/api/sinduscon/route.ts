import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {sindusconValues} from "@/lib/db/schema";
import {eq, and, inArray} from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const currentDate = new Date();
        const mes = currentDate.getMonth() + 1; // getMonth() retorna 0-11, então +1
        const ano = currentDate.getFullYear();
        const estado = searchParams.get("estado");

        // Se estado for fornecido, buscar apenas para esse estado
        if (estado) {
            const values = await db
                .select()
                .from(sindusconValues)
                .where(
                    and(
                        eq(sindusconValues.mes, mes),
                        eq(sindusconValues.ano, ano),
                        eq(sindusconValues.estado, estado)
                    )
                );

            return NextResponse.json(values[0] || null);
        }

        // Se não, buscar todos os valores
        const values = await db
            .select()
            .from(sindusconValues)
            .where(and(eq(sindusconValues.mes, mes), eq(sindusconValues.ano, ano)));

        return NextResponse.json(values);
    } catch (error) {
        console.error("Erro ao buscar valores da Sinduscon:", error);
        return NextResponse.json(
            {error: "Erro interno do servidor"},
            {status: 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {mes, ano, values} = body;

        if (!values || !values.estados || !Array.isArray(values.estados)) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const estadosParaAtualizar = values.estados.map((e: any) => e.estado);

        if(estadosParaAtualizar.length > 0) {
            await db
                .delete(sindusconValues)
                .where(and(
                    eq(sindusconValues.mes, mes),
                    eq(sindusconValues.ano, ano),
                    inArray(sindusconValues.estado, estadosParaAtualizar)
                ));
        }

        const valuesToInsert = values.estados.map((estadoData: any) => ({
            r1: JSON.stringify(estadoData.r1),
            r8: JSON.stringify(estadoData.r8),
            r16: JSON.stringify(estadoData.r16),
            pp4: JSON.stringify(estadoData.pp4),
            pis: estadoData.pis ?? null,
            cal8: JSON.stringify(estadoData.cal8),
            csl8: JSON.stringify(estadoData.csl8),
            csl16: JSON.stringify(estadoData.csl16),
            rp1q: estadoData.rp1q ?? null,
            gi: estadoData.gi ?? null,
            mes,
            ano,
            estado: estadoData.estado
        }));

        if (valuesToInsert.length > 0) {
            await db.insert(sindusconValues).values(valuesToInsert);
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Erro ao salvar valores da Sinduscon:", error);
        return NextResponse.json(
            {error: "Erro interno do servidor"},
            {status: 500}
        );
    }
}
