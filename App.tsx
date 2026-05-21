import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

type Pokemon = {
  id: number;
  name: string;
  image: string;
  height: number;
  weight: number;
  baseExperience: number;
  types: string[];
  abilities: string[];
  stats: {
    name: string;
    value: number;
  }[];
  description: string;
};

export default function App() {
  const { width } = useWindowDimensions();
  const [pokemonName, setPokemonName] = useState('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const isSmallScreen = width < 520;
  const noTranslateTextProps = {
    lang: 'en',
    dataSet: { google: 'notranslate' },
  } as any;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('translate', 'no');

    if (!document.querySelector('meta[name="google"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google';
      meta.content = 'notranslate';
      document.head.appendChild(meta);
    }
  }, []);

  async function searchPokemon() {
    try {
      const searchName = pokemonName.trim().toLowerCase();

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchName}`
      );

      if (!response.ok) {
        throw new Error('Pokemon nao encontrado');
      }

      const data = await response.json();
      const types = data.types.map((item: { type: { name: string } }) => item.type.name);
      const abilities = data.abilities.map(
        (item: { ability: { name: string } }) => item.ability.name
      );
      const height = data.height / 10;
      const weight = data.weight / 10;
      const pokemonDisplayName = formatPokemonName(data.name);

      setPokemon({
        id: data.id,
        name: data.name,
        image: data.sprites.front_default,
        height,
        weight,
        baseExperience: data.base_experience,
        types,
        abilities,
        stats: data.stats.map(
          (item: { base_stat: number; stat: { name: string } }) => ({
            name: item.stat.name,
            value: item.base_stat,
          })
        ),
        description: `${pokemonDisplayName} é um Pokémon do tipo ${formatList(
          types.map(translateType)
        )}. Ele mede ${height.toFixed(1)} m, pesa ${weight.toFixed(
          1
        )} kg e possui ${data.base_experience} pontos de experiência base. Suas habilidades são ${formatList(
          abilities.map(formatPokemonName)
        )}.`,
      });
    } catch (error) {
      setPokemon(null);
      Alert.alert('Erro', 'Pokemon nao encontrado');
    }
  }

  function formatPokemonName(name: string) {
    return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function getCardColor(name: string) {
    const colors = ['#48cda5', '#5eb2ff', '#ff656b', '#ffb44d', '#6b92ef'];
    return colors[name.length % colors.length];
  }

  function formatList(items: string[]) {
    if (items.length <= 1) {
      return items[0] ?? '';
    }

    return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
  }

  function translateType(type: string) {
    const labels: Record<string, string> = {
      normal: 'normal',
      fire: 'fogo',
      water: 'água',
      electric: 'elétrico',
      grass: 'grama',
      ice: 'gelo',
      fighting: 'lutador',
      poison: 'venenoso',
      ground: 'terra',
      flying: 'voador',
      psychic: 'psíquico',
      bug: 'inseto',
      rock: 'pedra',
      ghost: 'fantasma',
      dragon: 'dragão',
      dark: 'sombrio',
      steel: 'aço',
      fairy: 'fada',
    };

    return labels[type] ?? type;
  }

  function formatStatName(name: string) {
    const labels: Record<string, string> = {
      hp: 'HP',
      attack: 'Ataque',
      defense: 'Defesa',
      'special-attack': 'Atq. Esp.',
      'special-defense': 'Def. Esp.',
      speed: 'Velocidade',
    };

    return labels[name] ?? formatPokemonName(name);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />

      <View style={[styles.pokedex, isSmallScreen && styles.pokedexSmall]}>
        <Text style={[styles.logo, isSmallScreen && styles.logoSmall]}>
          Pok<Text style={styles.logoAccent}>e</Text>Dex
        </Text>

        <View style={[styles.searchBox, isSmallScreen && styles.searchBoxSmall]}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do Pokemon"
            placeholderTextColor="#8998aa"
            value={pokemonName}
            onChangeText={setPokemonName}
          />

          <TouchableOpacity style={styles.button} onPress={searchPokemon}>
            <Text style={styles.buttonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {pokemon ? (
            <View
              style={[
                styles.card,
                { backgroundColor: getCardColor(pokemon.name) },
                isSmallScreen ? styles.cardSmall : styles.cardLarge,
              ]}
            >
              <View style={styles.cardCircleLarge} />
              <View style={styles.cardCircleSmall} />

              <View style={styles.cardInfo}>
                <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
                <Text {...noTranslateTextProps} style={styles.name}>
                  {formatPokemonName(pokemon.name)}
                </Text>
                <View style={styles.typeList}>
                  {pokemon.types.map((type) => (
                    <View key={type} style={styles.typePill}>
                      <Text style={styles.typeText}>{translateType(type)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Image source={{ uri: pokemon.image }} style={styles.image} />
            </View>
          ) : (
            <View style={[styles.emptyCard, isSmallScreen && styles.emptyCardSmall]}>
              <Text style={styles.emptyTitle}>Busque um Pokemon</Text>
              <Text style={styles.emptyText}>O resultado aparece aqui em formato de card.</Text>
            </View>
          )}
        </View>

        {pokemon && (
          <View style={[styles.detailsPanel, isSmallScreen && styles.detailsPanelSmall]}>
            <Text style={styles.detailsTitle}>Informacoes do Pokemon</Text>
            <Text style={styles.description}>
              {pokemon.description}
            </Text>

            <View style={styles.detailGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Altura</Text>
                <Text style={styles.detailValue}>{pokemon.height.toFixed(1)} m</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Peso</Text>
                <Text style={styles.detailValue}>{pokemon.weight.toFixed(1)} kg</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Experiencia</Text>
                <Text style={styles.detailValue}>{pokemon.baseExperience}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Habilidades</Text>
                <Text {...noTranslateTextProps} style={styles.detailValue}>
                  {pokemon.abilities.map(formatPokemonName).join(', ')}
                </Text>
              </View>
            </View>

            <View style={styles.statsPanel}>
              <Text style={styles.statsTitle}>Estatisticas base</Text>
              {pokemon.stats.map((stat) => (
                <View key={stat.name} style={styles.statRow}>
                  <Text style={styles.statName}>{formatStatName(stat.name)}</Text>
                  <View style={styles.statTrack}>
                    <View
                      style={[
                        styles.statFill,
                        { width: `${Math.min(stat.value, 160) / 1.6}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b91f2d',
  },

  content: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#b91f2d',
    paddingHorizontal: 18,
    paddingVertical: 28,
  },

  pokedex: {
    width: '100%',
    maxWidth: 760,
    minHeight: '100%',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 28,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8f1722',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff1f2',
  },

  pokedexSmall: {
    paddingHorizontal: 12,
    borderLeftWidth: 2,
    borderRightWidth: 2,
  },

  logo: {
    color: '#284aa8',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 52,
    marginBottom: 18,
    textShadowColor: '#ffd94d',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },

  logoSmall: {
    fontSize: 36,
    lineHeight: 44,
  },

  logoAccent: {
    color: '#e84d58',
  },

  searchBox: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  searchBoxSmall: {
    flexDirection: 'column',
  },

  input: {
    flex: 1,
    minHeight: 42,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e4edf6',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#16283d',
    fontSize: 15,
  },

  button: {
    minHeight: 42,
    minWidth: 116,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#e84d58',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },

  grid: {
    width: '100%',
    alignItems: 'center',
  },

  card: {
    minHeight: 138,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#17324d',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },

  cardLarge: {
    width: 340,
  },

  cardSmall: {
    width: '100%',
  },

  cardCircleLarge: {
    position: 'absolute',
    right: -34,
    bottom: -44,
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 18,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  cardCircleSmall: {
    position: 'absolute',
    right: 42,
    top: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },

  cardInfo: {
    flex: 1,
    zIndex: 1,
  },

  number: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },

  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },

  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },

  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  image: {
    width: 118,
    height: 118,
    resizeMode: 'contain',
    zIndex: 1,
  },

  emptyCard: {
    width: 340,
    minHeight: 138,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderWidth: 2,
    borderColor: '#dce6f2',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fff',
  },

  emptyCardSmall: {
    width: '100%',
  },

  emptyTitle: {
    color: '#284aa8',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyText: {
    color: '#74869b',
    fontSize: 14,
    textAlign: 'center',
  },

  detailsPanel: {
    width: 340,
    marginTop: 18,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e4edf6',
    shadowColor: '#17324d',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  detailsPanelSmall: {
    width: '100%',
  },

  detailsTitle: {
    color: '#284aa8',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },

  description: {
    color: '#516174',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },

  detailBox: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 70,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f4f8fd',
  },

  detailLabel: {
    color: '#8998aa',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  detailValue: {
    color: '#16283d',
    fontSize: 15,
    fontWeight: '800',
  },

  statsPanel: {
    gap: 9,
  },

  statsTitle: {
    color: '#284aa8',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },

  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statName: {
    width: 86,
    color: '#516174',
    fontSize: 12,
    fontWeight: '800',
  },

  statTrack: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
    borderRadius: 99,
    backgroundColor: '#e4edf6',
  },

  statFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#48cda5',
  },

  statValue: {
    width: 34,
    color: '#16283d',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
});
