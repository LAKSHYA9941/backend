// High quality imagery tailored for kapda.co streetwear & tech accessories aesthetic
export const getProductImage = (product) => {
  const name = (product.name || "").toLowerCase();
  const id = (product.product_id || "").toLowerCase();

  if (name.includes("mouse") || id.includes("001")) {
    return "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("keyboard") || id.includes("002")) {
    return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("hub") || id.includes("003")) {
    return "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("headphone") || id.includes("004")) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("stand") || id.includes("005")) {
    return "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("monitor") || id.includes("006")) {
    return "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("power bank") || id.includes("007")) {
    return "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("webcam") || id.includes("008")) {
    return "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("ssd") || id.includes("009")) {
    return "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("watch") || id.includes("010")) {
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";
  }

  // Streetwear fallback
  return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";
};

export const getProductCategory = (product) => {
  const name = (product.name || "").toLowerCase();
  if (name.includes("keyboard") || name.includes("mouse") || name.includes("hub")) return "PERIPHERALS";
  if (name.includes("headphones") || name.includes("watch")) return "WEARABLES";
  if (name.includes("monitor") || name.includes("stand") || name.includes("webcam")) return "WORKSPACE";
  if (name.includes("power") || name.includes("ssd")) return "HARDWARE";
  return "ESSENTIALS";
};

