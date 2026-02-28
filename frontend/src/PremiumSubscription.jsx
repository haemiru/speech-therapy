import React, { useState } from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";

function PremiumSubscription() {
    const [isPremium, setIsPremium] = useState(false);

    if (isPremium) {
        return (
            <div className="bg-primary/20 text-emerald-900 dark:text-emerald-100 p-5 rounded-2xl shadow-sm border border-primary/30 text-center">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">workspace_premium</span>
                <h3 className="text-lg font-bold">Premium Active</h3>
                <p className="text-sm mt-1 opacity-80">You have full access to advanced analytics and unlimited children profiles.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-amber-400 text-3xl">star</span>
                <div>
                    <h3 className="text-lg font-bold">Upgrade to Premium</h3>
                    <p className="text-xs text-slate-400">Unlock advanced analytics and unlimited profiles.</p>
                </div>
            </div>

            <div className="bg-slate-800 dark:bg-slate-900 p-4 rounded-xl mb-4 border border-slate-700">
                <p className="text-center text-sm font-medium mb-2">Subscribe for $9.99 / month</p>
                <div className="w-full relative z-0">
                    <PayPalButtons
                        style={{ layout: "vertical", color: "blue", shape: "rect", label: "subscribe" }}
                        createSubscription={(data, actions) => {
                            return actions.subscription.create({
                                'plan_id': 'P-5ML4271244454362WXNWU5NQ' // Replace with your actual plan ID later
                            });
                        }}
                        onApprove={async (data, actions) => {
                            console.log("Subscription approved:", data);
                            setIsPremium(true);
                        }}
                        onError={(err) => {
                            console.error("PayPal Error:", err);
                        }}
                    />
                </div>
            </div>
            <p className="text-[10px] text-center text-slate-500">Cancel anytime. Terms and conditions apply.</p>
        </div>
    );
}

export default PremiumSubscription;
