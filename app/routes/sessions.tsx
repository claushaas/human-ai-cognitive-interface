import { useState } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import {
	Link,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from 'react-router';
import { SessionFilters, SessionList } from '~/components/stages';
import { Button, Card, CardContent, Header } from '~/components/ui';
import { createRepositories } from '~/db';
import type {
	PaginatedSessions,
	SessionFilters as SessionFiltersType,
} from '~/types/dashboard';

interface LoaderData {
	sessions: PaginatedSessions;
	filters: SessionFiltersType;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
	const db = context.cloudflare.env.DB;
	const repos = createRepositories({ DB: db });

	// Parse query params
	const url = new URL(request.url);
	const page = Number.parseInt(url.searchParams.get('page') || '1', 10);
	const search = url.searchParams.get('search') || undefined;
	const role = url.searchParams.get('role') || undefined;
	const level = url.searchParams.get('level') || undefined;
	const status = url.searchParams.get('status') || undefined;

	const pageSize = 12;
	const offset = (page - 1) * pageSize;

	// Fetch sessions with filters
	const result = await repos.sessions.list({
		level,
		limit: pageSize,
		offset,
		role: role as SessionFiltersType['role'],
		search,
		status,
	});

	const filters: SessionFiltersType = {
		level: level as SessionFiltersType['level'],
		role: role as SessionFiltersType['role'],
		search,
		status: status as SessionFiltersType['status'],
	};

	return new Response(
		JSON.stringify({
			filters,
			sessions: result,
		} as LoaderData),
		{
			headers: { 'Content-Type': 'application/json' },
		},
	);
}

export function meta() {
	return [
		{ title: 'Histórico de Sessões — HACI' },
		{
			content: 'Visualize e gerencie suas sessões cognitivas',
			name: 'description',
		},
	];
}

export default function SessionsPage() {
	const loaderData = useLoaderData<typeof loader>();
	const data = loaderData
		? (JSON.parse(String(loaderData)) as LoaderData)
		: null;
	const _navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	const [filters, setFilters] = useState<SessionFiltersType>(
		data?.filters || {},
	);

	const handleFilterChange = (newFilters: SessionFiltersType) => {
		setFilters(newFilters);

		// Update URL params
		const params = new URLSearchParams();
		if (newFilters.role) params.set('role', newFilters.role);
		if (newFilters.level) params.set('level', newFilters.level);
		if (newFilters.status) params.set('status', newFilters.status);
		if (newFilters.search) params.set('search', newFilters.search);
		params.set('page', '1'); // Reset to page 1 on filter change

		setSearchParams(params);
	};

	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', page.toString());
		setSearchParams(params);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="container mx-auto max-w-6xl px-4 py-8">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
					<Link className="hover:text-gray-700" to="/">
						Início
					</Link>
					<span>/</span>
					<span className="text-gray-900">Histórico</span>
				</div>

				{/* Page Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Histórico de Sessões
						</h1>
						<p className="text-gray-600 mt-1">
							Visualize e gerencie suas sessões cognitivas anteriores
						</p>
					</div>
					<Link to="/session/new">
						<Button size="lg">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 4v16m8-8H4"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
							Nova Sessão
						</Button>
					</Link>
				</div>

				{/* Filters */}
				<SessionFilters filters={filters} onChange={handleFilterChange} />

				{/* Sessions List */}
				<Card>
					<CardContent className="p-6">
						{data?.sessions ? (
							<SessionList
								onPageChange={handlePageChange}
								pagination={data.sessions.pagination}
								sessions={data.sessions.sessions}
							/>
						) : (
							<div className="text-center py-12">
								<div className="animate-pulse space-y-4">
									<div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
									<div className="h-32 bg-gray-200 rounded" />
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
