
import ExchangeAssets from '@/views/wallet/exchange-assets'; 
import OptionAssets from '@/views/wallet/option-assets'; 
import ContractAssets from '@/views/wallet/contract-assets'; 
import Transfer from '@/views/wallet/transfer'; 
import DirectRecharge from '@/views/wallet/direct-recharge';
import Reward from '@/views/wallet/reward';
import Funding from '@/views/wallet/funding';
import Address from '@/views/wallet/address';
import Otc from '@/views/wallet/otc-assets';
import Exchange from '@/views/wallet/exchange';
export default [
    {
        name: "exchange-assets",
        path: "/wallet/assets/exchange", // 钱包资产页面
        component: ExchangeAssets
    },
    {
        name: "option-assets",
        path: "/wallet/assets/option", // 钱包资产页面
        component: OptionAssets
    },
    {
        name: "contract-assets",
        path: "/wallet/assets/contract", // 钱包资产页面
        component: ContractAssets
    },
    {
        name: "transfer",
        path: "/wallet/transfer", // 资金划转
        component: Transfer
    },
    {
        name: "direct-recharge",
        path: "/wallet/direct-recharge", // 直充
        component: DirectRecharge
    },
    {
        name: "reward",
        path: "/wallet/reward",   // 返佣页面
        component: Reward
    },
    {
        name: "funding",
        path: "/wallet/funding",   // 重值提币记录
        component: Funding
    },
    {
        name : "address",
        path : "/wallet/address", // 地址管理
        component : Address
    },
    {
        name : "otcAssets",
        path : "/wallet/otc", // 地址管理
        component : Otc
    },
	{
		name:"exchange",
		path:"/wallet/exchange",
		component:Exchange
	}
]