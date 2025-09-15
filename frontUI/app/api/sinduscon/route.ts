import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {sindusconValues} from "@/lib/db/schema";
import {eq, and} from "drizzle-orm";

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
        const {mes, ano, valores} = body;
        console.log(body)
        // Deletar valores existentes para o mês/ano
        await db
            .delete(sindusconValues)
            .where(and(eq(sindusconValues.mes, mes), eq(sindusconValues.ano, ano)));

        // Inserir novos valores
        const valuesToInsert = {
            r1: values.r1,
            r8: JSON.stringify(values.r8),
            r16: JSON.stringify(values.r16),
            pp4: JSON.stringify(values.pp4),
            pis: values.pis ?? null,
            cal8: JSON.stringify(values.cal8),
            csl8: JSON.stringify(values.csl8),
            csl16: JSON.stringify(values.csl16),
            rp1q: values.rp1q ?? null,
            gi: values.gi ?? null,
            mes,
            ano,
            estado: valores.estado
        };

        await db.insert(sindusconValues).values(valuesToInsert);

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Erro ao salvar valores da Sinduscon:", error);
        return NextResponse.json(
            {error: "Erro interno do servidor"},
            {status: 500}
        );
    }
}
