

import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { getRoles, getUserRoles, assignRole, removeRole } from "../lib/api";

export default function Roles({ userId, token }) {
	const [allRoles, setAllRoles] = useState([]);
	const [userRoles, setUserRoles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionLoading, setActionLoading] = useState({});

	useEffect(() => {
		async function fetchRoles() {
			setLoading(true);
			setError("");
			try {
				const rolesRes = await getRoles(token);
				const userRolesRes = await getUserRoles(token, userId);
				setAllRoles(rolesRes.roles || []);
					setUserRoles(userRolesRes.roles ? userRolesRes.roles.map(r => r.id) : []);
				} catch {
					setError("Failed to fetch roles.");
				}
			setLoading(false);
		}
		fetchRoles();
	}, [userId, token]);

	const handleAssign = async (roleId) => {
		setActionLoading((prev) => ({ ...prev, [roleId]: true }));
		try {
			await assignRole(token, userId, roleId);
			setUserRoles((prev) => [...prev, roleId]);
			setError("");
		} catch {
			setError("Failed to assign role.");
		}
		setActionLoading((prev) => ({ ...prev, [roleId]: false }));
	};

	const handleRemove = async (roleId) => {
		setActionLoading((prev) => ({ ...prev, [roleId]: true }));
		try {
			await removeRole(token, userId, roleId);
			setUserRoles((prev) => prev.filter((id) => id !== roleId));
			setError("");
		} catch {
			setError("Failed to remove role.");
		}
		setActionLoading((prev) => ({ ...prev, [roleId]: false }));
	};

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} />;

	return (
		<div className="max-w-md mx-auto p-6 bg-gradient-to-br from-teal-100 to-teal-300 rounded-xl shadow-lg mt-8">
			<h2 className="text-2xl font-bold mb-6 text-teal-700">User Roles</h2>
			{allRoles.length === 0 ? (
				<div className="text-gray-500">No roles available.</div>
			) : (
				<ul className="space-y-2">
					{allRoles.map(role => {
						const assigned = userRoles.includes(role.id);
						return (
							<li key={role.id} className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow text-teal-700 font-semibold border border-teal-200">
								<span>{role.name}</span>
								<span className="flex items-center gap-2">
									{assigned ? (
										<>
											<span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Assigned</span>
											<button
												className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
												onClick={() => handleRemove(role.id)}
												disabled={actionLoading[role.id]}
											>
												{actionLoading[role.id] ? "Removing..." : "Remove"}
											</button>
										</>
									) : (
										<button
											className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
											onClick={() => handleAssign(role.id)}
											disabled={actionLoading[role.id]}
										>
											{actionLoading[role.id] ? "Assigning..." : "Assign"}
										</button>
									)}
								</span>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
