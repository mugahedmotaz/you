"use client"

import { Heart, Github, Globe, Mail, Shield, Download } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Download className="h-8 w-8 text-blue-400" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Mugahed
              </h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              محمل فيديوهات يوتيوب احترافي وسريع. احصل على فيديوهاتك المفضلة بأعلى جودة ممكنة.
            </p>
            <div className="flex m-4 p-4 space-x-2">
              <Link 
                href="https://github.com/mugahedmotaz" 
                className="p-2 ml-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:contact@mugahed.dev" 
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </Link>
              <Link 
                href="https://mugahed.dev" 
                className="p-2  bg-gray-700 hover:bg-gray-600 rounded-full transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-5 w-5 " />
              </Link>
                
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">المميزات</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">تحميل بجودة عالية</li>
              <li className="hover:text-white transition-colors cursor-pointer">دعم جميع التنسيقات</li>
              <li className="hover:text-white transition-colors cursor-pointer">سرعة فائقة</li>
              <li className="hover:text-white transition-colors cursor-pointer">واجهة عربية</li>
              <li className="hover:text-white transition-colors cursor-pointer">مجاني بالكامل</li>
            </ul>
          </div>

          {/* Supported Formats */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">التنسيقات المدعومة</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">MP4 - 1080p, 720p, 480p</li>
              <li className="hover:text-white transition-colors cursor-pointer">MP3 - جودة عالية</li>
              <li className="hover:text-white transition-colors cursor-pointer">قوائم التشغيل</li>
              <li className="hover:text-white transition-colors cursor-pointer">فيديوهات طويلة</li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4 ">
            <h4 className="text-lg font-semibold text-blue-400">الدعم والقانونية</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">شروط الاستخدام</li>
              <li className="hover:text-white transition-colors cursor-pointer">سياسة الخصوصية</li>
              <li className="hover:text-white transition-colors cursor-pointer">الأسئلة الشائعة</li>
              <li className="hover:text-white transition-colors cursor-pointer">تواصل معنا</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>© {currentYear} Mugahed. جميع الحقوق محفوظة.</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>صُنع بـ</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>في السودان</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-400 leading-relaxed">
              <p className="mb-2">
                <strong className="text-yellow-400">إخلاء مسؤولية:</strong> هذا التطبيق مخصص للاستخدام الشخصي فقط. 
                يرجى احترام حقوق الطبع والنشر والامتثال لشروط خدمة يوتيوب.
              </p>
              <p>
                نحن لا نتحمل أي مسؤولية عن سوء استخدام هذا التطبيق أو انتهاك حقوق الطبع والنشر.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
