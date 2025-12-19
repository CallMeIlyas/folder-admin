import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import useScrollFloat from "../../utils/scrollFloat";
import { useTranslation } from "react-i18next";
import { apiAsset } from "../../utils/api";

const DateInput = ({
  name,
  value,
  onChange,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const formatDisplayDate = (iso: string) => {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="relative inline-block w-48">
      <input
        type="date"
        name={name}
        value={value || ""}
        min={getMinDate()}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 10);
        }}
        className="text-center rounded-full border px-6 py-2 outline-none w-full"
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          textAlignLast: "center",
          color: "transparent",
          caretColor: "black",
          backgroundColor: "#dcbec1",
        }}
        placeholder=" "
      />
      
      {!value && !isFocused ? (
        <span className="absolute inset-0 flex items-center justify-center text-black text-sm font-poppinsSemiBoldItalic pointer-events-none">
          {placeholder}
        </span>
      ) : value ? (
        <span className="absolute inset-0 flex items-center justify-center text-black text-sm font-poppinsSemiBold pointer-events-none">
          {formatDisplayDate(value)}
        </span>
      ) : null}
    </div>
  );
};

// Komponen terpisah untuk modal lokasi
const LocationModal = ({ 
  district: initialDistrict, 
  city: initialCity, 
  onSave, 
  onClose 
}: { 
  district: string; 
  city: string; 
  onSave: (district: string, city: string) => void; 
  onClose: () => void; 
}) => {
  const [district, setDistrict] = useState(initialDistrict);
  const [city, setCity] = useState(initialCity);
  const { t } = useTranslation();

  const handleSave = () => {
    onSave(district, city);
  };

  return (
    <div className="space-y-4 font-poppinsSemiBold">
      <div>
        <label className="block text-sm font-poppinsSemiBold text-gray-700 mb-1 text-left">
          Kecamatan
        </label>
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="Masukkan kecamatan"
          className="w-full border rounded-full px-5 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="block text-sm font-poppinsSemiBold text-gray-700 mb-1 text-left">
          Kota
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Masukkan kota"
          className="w-full border  rounded-full px-5 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          {t("orderSteps.modal.cancel")}
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-full bg-[#dcbec1] text-black hover:bg-[#c7a9ac] transition"
        >
          {t("orderSteps.modal.save")}
        </button>
      </div>
    </div>
  );
};

const OrderSteps = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({
    faces: "",
    frames: "",
    size: "",
    district: "",
    city: "",
    deadline: "",
  });

  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<any>(null);
  const [promptValue, setPromptValue] = useState("");

  // state untuk ukuran
  const [category, setCategory] = useState<"2D" | "3D" | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  useScrollFloat(".scroll-float", {
    yIn: 50,
    yOut: 40,
    blurOut: 6,
    inDuration: 1.1,
    stagger: 0.15,
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const steps = [
    { 
      number: 1, 
      icon: apiAsset("/api/uploads/images/Icons/people.png"), 
      text: t("orderSteps.steps.faces"), 
      key: "faces" 
    },
    { 
      number: 2, 
      icon: apiAsset("/api/uploads/images/Icons/frame.png"), 
      text: t("orderSteps.steps.frames"), 
      key: "frames" 
    },
    { 
      number: 3, 
      icon: apiAsset("/api/uploads/images/Icons/size.png"), 
      text: t("orderSteps.steps.size"), 
      key: "size" 
    },
    { 
      number: 4, 
      icon: apiAsset("/api/uploads/images/Icons/location.png"), 
      text: t("orderSteps.steps.city"), 
      key: "location" 
    },
    { 
      number: 5, 
      icon: apiAsset("/api/uploads/images/Icons/calendar.png"), 
      text: t("orderSteps.steps.deadline"), 
      key: "deadline" 
    },
    { 
      number: 6, 
      icon: apiAsset("/api/uploads/images/Icons/whatsapp.png"), 
      text: t("orderSteps.steps.admin"), 
      special: true 
    },
  ];

  const waNumber = "6281380340307";
  const waMessage = `
Caricature amount on 1 frame = ${form.faces}
Frame Quantity = ${form.frames}
Frame Size = ${form.size}
District = ${form.district}
City = ${form.city}
Deadline date & month = ${form.deadline}
  `.trim();
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleStepClick = (step: any) => {
    if (step.number === 6) {
      window.open(waLink, "_blank");
      return;
    }
    if (step.number === 5) return;
    setActiveStep(step);
    
    if (step.key === "location") {
      setPromptValue("");
    } else if (step.key === "faces" || step.key === "frames") {
      setPromptValue(form[step.key as keyof typeof form] || "");
    } else {
      setPromptValue(form[step.key as keyof typeof form] || "");
    }
    setIsPromptOpen(true);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, deadline: e.target.value }));
  };

  const handlePromptSave = () => {
    if (activeStep) {
      if (activeStep.key === "size") {
        setForm((prev) => ({
          ...prev,
          size: selectedSize ? `${category} - ${selectedSize}` : "",
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [activeStep.key]: promptValue.trim(),
        }));
      }
    }
    setIsPromptOpen(false);
  };

  const handleClearSelection = () => {
    setCategory(null);
    setSelectedSize("");
    setForm((prev) => ({ ...prev, size: "" }));
  };

  const handleLocationSave = (district: string, city: string) => {
    setForm((prev) => ({ 
      ...prev, 
      district: district.trim(), 
      city: city.trim() 
    }));
    setIsPromptOpen(false);
  };

  const handleCloseModal = () => {
    setIsPromptOpen(false);
    setCategory(null);
    setSelectedSize("");
  };

  const sizes2D = [
    { size: "4R", faces: "1 wajah" },
    { size: "15cm", faces: "1-2 wajah" },
    { size: "6R", faces: "1-3 wajah" },
    { size: "8R", faces: "1-6 wajah" },
    { size: "12R", faces: "1-20 wajah" }
  ];

  const sizes3D = [
    { size: "4R", faces: "1 wajah" },
    { size: "15cm", faces: "1-2 wajah" },
    { size: "6R", faces: "1-3 wajah" },
    { size: "20cm", faces: "1-4 wajah" },
    { size: "8R", faces: "1-6 wajah" },
    { size: "10R", faces: "1-10 wajah" },
    { size: "12R", faces: "1-20 wajah" },
    { size: "A2 40X55cm", faces: "1-30 wajah" },
    { size: "A1 55x80cm", faces: "1-40 wajah" },
    { size: "A0 80x110cm", faces: "1-60 wajah" }
  ];

  const getDisplayText = (step: any) => {
    if (!form[step.key as keyof typeof form]) {
      if (step.key === "size") {
        return currentLang === "id" ? "Pilih ukuran bingkai" : "Choose frame size";
      }
      if (step.key === "location") {
        return currentLang === "id" ? "Ketik jawabanmu di sini" : "Type your answer here";
      }
      return currentLang === "id" ? "Ketik jawabanmu di sini" : "Type your answer here";
    }
    
    if (step.key === "location") {
      if (form.district && form.city) {
        return `${form.district}, ${form.city}`;
      }
      return form.district || form.city || "";
    }
    
    return form[step.key as keyof typeof form];
  };

  // Fungsi untuk merender tampilan lokasi (2 kolom vertikal jika sudah diisi, 1 kolom jika belum)
  const renderLocationDisplay = () => {
    const hasDistrict = form.district && form.district.trim() !== "";
    const hasCity = form.city && form.city.trim() !== "";
    
    // Jika kedua data sudah diisi, tampilkan 2 kolom vertikal dengan label
    if (hasDistrict && hasCity) {
      return (
        <div className="space-y-3 w-full">
          {/* Kecamatan */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-poppinsSemiBold text-left pl-4">
              Kecamatan
            </div>
            <div className="text-center rounded-full border bg-[#dcbec1] px-6 py-2 w-full">
              <span className="text-sm font-poppinsSemiBold text-black">
                {form.district}
              </span>
            </div>
          </div>
          
          {/* Kota */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-poppinsSemiBold text-left pl-4">
              Kota
            </div>
            <div className="text-center rounded-full border px-6 py-2 bg-[#dcbec1] w-full">
              <span className="text-sm font-poppinsSemiBold text-black">
                {form.city}
              </span>
            </div>
          </div>
        </div>
      );
    }
    
    // Jika hanya satu yang diisi atau belum diisi sama sekali, tampilkan 1 kolom
    return (
      <div className="text-center rounded-full border  px-6 py-2 bg-[#dcbec1] w-full">
        <span className={`text-sm font-poppinsSemiBoldItalic ${
          hasDistrict || hasCity ? "text-black" : "text-black"
        }`}>
          {hasDistrict || hasCity ? `${form.district}${form.city ? `, ${form.city}` : ''}` : 
            currentLang === "id" ? "Ketik jawabanmu di sini" : "Type your answer here"}
        </span>
      </div>
    );
  };

  const renderStepCard = (step: any) => (
    <div
      key={step.number}
      onClick={() => handleStepClick(step)}
      className="float-item bg-white rounded-xl p-5 relative flex flex-col items-center justify-between h-full cursor-pointer transition-transform hover:-translate-y-1 shadow-none group hover:shadow-hover hover:scale-110 transition-all duration-300"
    >
      <div
        className={`absolute -top-3 left-5 text-sm rounded-full w-7 h-7 flex items-center justify-center font-poppinsSemiBold ${
          step.special ? "bg-red-500" : "bg-black"
        } text-white`}
      >
        {step.number}
      </div>

      <img
        src={step.icon}
        alt={`Step ${step.number}`}
        className="!w-[170px] !h-[170px] object-contain group-hover:scale-110 transition-transform duration-500"
      />

      {step.special ? (
        <button className="bg-[#dcbec1] text-black font-poppinsSemiBold text-sm rounded-full px-8 py-3 hover:bg-[#c7a9ac] transition-colors duration-300 min-h-[36px] flex items-center justify-center">
          {step.text}
        </button>
      ) : (
        <p className="font-poppinsRegular text-sm text-gray-600 text-center min-h-[36px] flex items-center justify-center">
          {step.text}
        </p>
      )}

      {step.number === 5 && (
        <div className="flex items-center gap-2 mt-3 w-full justify-center">
          <DateInput
            name="deadline"
            value={form.deadline}
            onChange={handleDateChange}
            placeholder={t("orderSteps.modal.selectDate")}
          />
        </div>
      )}

      {step.number !== 6 && step.number !== 5 && (
        <div className="w-full mt-3 flex justify-center">
          <div className="relative inline-block w-56">
            {step.key === "location" ? (
              // Tampilan khusus untuk lokasi
              renderLocationDisplay()
            ) : (
              // Tampilan normal untuk step lainnya
              <div className="text-center rounded-full border  px-6 py-2 bg-[#dcbec1] w-full">
                <span
                  className={`text-sm font-poppinsSemiBoldItalic ${
                    form[step.key as keyof typeof form] ? "text-black" : "text-black"
                  }`}
                >
                  {getDisplayText(step)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderPromptContent = () => {
    if (activeStep?.key === "size") {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-poppinsSemiBold text-lg text-gray-800">{activeStep?.text}</h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>

          {!category ? (
            <div className="flex justify-center gap-4 mt-4">
              {["2D", "3D"].map((type) => (
                <button
                  key={type}
                  onClick={() => setCategory(type as "2D" | "3D")}
                  className="px-5 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition font-poppinsSemiBold"
                >
                  {type}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div 
                className="grid grid-cols-1 gap-2 mt-3 max-h-60 overflow-y-auto pr-2"
                onWheel={(e) => e.stopPropagation()} // Mencegah scroll merambat ke parent
              >
                {(category === "2D" ? sizes2D : sizes3D).map((item) => (
                  <button
                    key={item.size}
                    onClick={() => setSelectedSize(item.size)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border transition ${
                      selectedSize === item.size
                        ? "bg-[#dcbec1] border-black"
                        : "bg-gray-100  hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-poppinsSemiBold">{item.size}</div>
                      <div className="text-xs text-gray-600">{item.faces}</div>
                    </div>
                    {selectedSize === item.size && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#dcbec1] flex-shrink-0">
                        <Check size={14} className="text-black" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-6 font-poppinsSemiBold">
                <button
                  onClick={() => setCategory(null)}
                  className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                >
                  {t("orderSteps.modal.back")}
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                >
                  {t("orderSteps.modal.clear")}
                </button>
                <button
                  onClick={handlePromptSave}
                  disabled={!selectedSize}
                  className={`px-4 py-2 rounded-full transition ${
                    selectedSize 
                      ? "bg-[#dcbec1] text-black hover:bg-[#c7a9ac]" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {t("orderSteps.modal.save")}
                </button>
              </div>
            </>
          )}
        </>
      );
    }

    if (activeStep?.key === "location") {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-poppinsSemiBold text-lg text-gray-800">{activeStep?.text}</h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>
          <LocationModal
            district={form.district}
            city={form.city}
            onSave={handleLocationSave}
            onClose={handleCloseModal}
          />
        </>
      );
    }

    if (activeStep?.key === "faces" || activeStep?.key === "frames") {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-poppinsSemiBold text-lg text-gray-800">{activeStep?.text}</h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={24} />
            </button>
          </div>
          <input
            type="number"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder={t("orderSteps.modal.placeholder")}
            className="w-full border font-poppinsSemiBold rounded-full px-5 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            min="1"
          />
          <div className="flex justify-center gap-4 mt-6 font-poppinsSemiBold">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            >
              {t("orderSteps.modal.cancel")}
            </button>
            <button
              onClick={handlePromptSave}
              className="px-4 py-2 rounded-full bg-[#dcbec1] text-black hover:bg-[#c7a9ac] transition"
            >
              {t("orderSteps.modal.save")}
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-poppinsSemiBold text-lg text-gray-800">{activeStep?.text}</h3>
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>
        <input
          type="text"
          value={promptValue}
          onChange={(e) => setPromptValue(e.target.value)}
          placeholder={t("orderSteps.modal.placeholder")}
          className="w-full border rounded-full px-5 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
        <div className="flex justify-center gap-4 mt-6 font-poppinsSemiBold">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            {t("orderSteps.modal.cancel")}
          </button>
          <button
            onClick={handlePromptSave}
            className="px-4 py-2 rounded-full bg-[#dcbec1] text-black hover:bg-[#c7a9ac] transition"
          >
            {t("orderSteps.modal.save")}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="relative my-10 text-center h-[1px]">
        <div className="absolute top-0 left-0 w-1/4 border-t-[5px] border-black"></div>
        <div className="absolute top-0 right-0 w-1/4 border-t-[5px] border-black"></div>
      </div>

      <section className={isMobile ? "py-8" : "py-16"}>
        <h2
          className={`scroll-float font-nataliecaydence text-center text-black ${
            isMobile ? "text-3xl mb-8" : "text-[46px] mb-20"
          }`}
        >
          {t("orderSteps.title")}
        </h2>

        {isMobile ? (
          <div data-scroll-group="true" className="scroll-float flex flex-col gap-4 px-4 max-w-md mx-auto">
            {steps.map(renderStepCard)}
          </div>
        ) : (
          <div data-scroll-group="true" className="scroll-float grid grid-cols-3 grid-rows-2 gap-6 max-w-5xl mx-auto px-5">
            {steps.map(renderStepCard)}
          </div>
        )}
      </section>

      {isPromptOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg animate-fadeIn max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Mencegah klik menutup modal
          >
            {renderPromptContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default OrderSteps;